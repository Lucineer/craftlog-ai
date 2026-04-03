import { addNode, addEdge, traverse, crossDomainQuery, findPath, domainStats, getDomainNodes } from './lib/knowledge-graph.js';
import { loadSeedIntoKG, FLEET_REPOS, loadAllSeeds } from './lib/seed-loader.js';
// src/index.ts — CraftLog AI Cloudflare Worker

import { ProjectTracker, MaterialInventory, CostEstimator, TutorialSearch } from "./craft/tracker";

interface Env {
  DEEPSEEK_API_KEY: string;
}

const tracker = new ProjectTracker();
const inventory = new MaterialInventory();
const costEstimator = new CostEstimator();
const tutorialSearch = new TutorialSearch();

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function handleChat(body: { messages: { role: string; content: string }[] }, env: Env): Promise<Response> {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "DeepSeek API key not configured" }, 500);
  }

  const systemPrompt = {
    role: "system",
    content: `You are CraftLog AI, a friendly and knowledgeable crafting and DIY assistant. You help users with:
- Project planning and material selection
- Step-by-step crafting instructions
- Cost estimation for DIY projects
- Tool recommendations and usage tips
- Creative ideas and inspiration
- Troubleshooting crafting problems

Be warm, encouraging, and practical. Use crafting terminology naturally. When suggesting projects, consider skill level and budget.`,
  };

  const messages = [systemPrompt, ...body.messages];

  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, stream: true }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return jsonResponse({ error: "DeepSeek API error", details: err }, 502);
  }

  return new Response(resp.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (path === '/health') {
    return new Response(JSON.stringify({ status: 'ok', repo: 'craftlog-ai', timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  const path = url.pathname;
  const method = request.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // --- POST /api/chat (SSE DeepSeek) ---
  if (method === "POST" && path === "/api/chat") {
    const body = (await request.json()) as { messages: { role: string; content: string }[] };
    return handleChat(body, env);
  }

  // --- /api/projects ---
  if (path === "/api/projects" && method === "GET") {
    const category = url.searchParams.get("category") || undefined;
    const status = url.searchParams.get("status") as "planned" | "in_progress" | "completed" | "abandoned" | undefined;
    return jsonResponse(tracker.list({ category, status }));
  }

  if (path === "/api/projects" && method === "POST") {
    const body = await request.json();
    const project = tracker.create(body as Parameters<typeof tracker.create>[0]);
    return jsonResponse(project, 201);
  }

  const projectMatch = path.match(/^\/api\/projects\/([\w-]+)$/);
  if (projectMatch) {
    const id = projectMatch[1];
    if (method === "GET") {
      const project = tracker.get(id);
      return project ? jsonResponse(project) : jsonResponse({ error: "Project not found" }, 404);
    }
    if (method === "PUT") {
      const body = await request.json();
      const updated = tracker.update(id, body as Record<string, unknown>);
      return updated ? jsonResponse(updated) : jsonResponse({ error: "Project not found" }, 404);
    }
    if (method === "DELETE") {
      return tracker.delete(id) ? jsonResponse({ success: true }) : jsonResponse({ error: "Project not found" }, 404);
    }
  }

  const stepMatch = path.match(/^\/api\/projects\/([\w-]+)\/steps\/complete$/);
  if (stepMatch && method === "POST") {
    const body = (await request.json()) as { stepOrder: number };
    const result = tracker.completeStep(stepMatch[1], body.stepOrder);
    return result ? jsonResponse(result) : jsonResponse({ error: "Project not found" }, 404);
  }

  const photoMatch = path.match(/^\/api\/projects\/([\w-]+)\/photos$/);
  if (photoMatch && method === "POST") {
    const body = (await request.json()) as { photoUrl: string };
    const result = tracker.addPhoto(photoMatch[1], body.photoUrl);
    return result ? jsonResponse(result) : jsonResponse({ error: "Project not found" }, 404);
  }

  const progressMatch = path.match(/^\/api\/projects\/([\w-]+)\/progress$/);
  if (progressMatch && method === "GET") {
    const progress = tracker.getProgress(progressMatch[1]);
    return jsonResponse({ progress });
  }

  // --- /api/materials/inventory ---
  if (path === "/api/materials/inventory" && method === "GET") {
    const category = url.searchParams.get("category") || undefined;
    const lowStock = url.searchParams.get("lowStock") === "true";
    return jsonResponse(inventory.list({ category, lowStock }));
  }

  if (path === "/api/materials/inventory" && method === "POST") {
    const body = await request.json();
    const material = inventory.add(body as Parameters<typeof inventory.add>[0]);
    return jsonResponse(material, 201);
  }

  const materialMatch = path.match(/^\/api\/materials\/inventory\/([\w-]+)$/);
  if (materialMatch) {
    const id = materialMatch[1];
    if (method === "GET") {
      const material = inventory.get(id);
      return material ? jsonResponse(material) : jsonResponse({ error: "Material not found" }, 404);
    }
    if (method === "PUT") {
      const body = await request.json();
      const updated = inventory.update(id, body as Record<string, unknown>);
      return updated ? jsonResponse(updated) : jsonResponse({ error: "Material not found" }, 404);
    }
    if (method === "DELETE") {
      return inventory.delete(id) ? jsonResponse({ success: true }) : jsonResponse({ error: "Material not found" }, 404);
    }
  }

  const consumeMatch = path.match(/^\/api\/materials\/inventory\/([\w-]+)\/consume$/);
  if (consumeMatch && method === "POST") {
    const body = (await request.json()) as { quantity: number };
    const result = inventory.consume(consumeMatch[1], body.quantity);
    return result ? jsonResponse(result) : jsonResponse({ error: "Material not found" }, 404);
  }

  const restockMatch = path.match(/^\/api\/materials\/inventory\/([\w-]+)\/restock$/);
  if (restockMatch && method === "POST") {
    const body = (await request.json()) as { quantity: number };
    const result = inventory.restock(restockMatch[1], body.quantity);
    return result ? jsonResponse(result) : jsonResponse({ error: "Material not found" }, 404);
  }

  if (path === "/api/materials/low-stock" && method === "GET") {
    return jsonResponse(inventory.getLowStock());
  }

  if (path === "/api/materials/total-value" && method === "GET") {
    return jsonResponse({ totalValue: inventory.getTotalValue() });
  }

  // --- /api/costs ---
  if (path === "/api/costs" && method === "GET") {
    const projectId = url.searchParams.get("projectId") || undefined;
    return jsonResponse(costEstimator.getEntries(projectId));
  }

  if (path === "/api/costs" && method === "POST") {
    const body = await request.json();
    const entry = costEstimator.addEntry(body as Parameters<typeof costEstimator.addEntry>[0]);
    return jsonResponse(entry, 201);
  }

  if (path === "/api/costs/total" && method === "GET") {
    return jsonResponse({ grandTotal: costEstimator.getGrandTotal() });
  }

  const costProjectMatch = path.match(/^\/api\/costs\/project\/([\w-]+)$/);
  if (costProjectMatch && method === "GET") {
    const projectId = costProjectMatch[1];
    return jsonResponse({
      total: costEstimator.getProjectTotal(projectId),
      byCategory: costEstimator.getTotalByCategory(projectId),
    });
  }

  const costEstimateMatch = path.match(/^\/api\/costs\/estimate$/);
  if (costEstimateMatch && method === "POST") {
    const body = (await request.json()) as {
      materials: { unitCost: number; quantity: number }[];
      laborHours: number;
      laborRate?: number;
    };
    return jsonResponse({
      estimate: costEstimator.estimateProject(body.materials, body.laborHours, body.laborRate),
    });
  }

  const costDeleteMatch = path.match(/^\/api\/costs\/([\w-]+)$/);
  if (costDeleteMatch && method === "DELETE") {
    return costEstimator.deleteEntry(costDeleteMatch[1])
      ? jsonResponse({ success: true })
      : jsonResponse({ error: "Entry not found" }, 404);
  }

  // --- /api/tutorials ---
  if (path === "/api/tutorials" && method === "GET") {
    const query = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const difficulty = url.searchParams.get("difficulty") || undefined;
    return jsonResponse(tutorialSearch.search(query, { category, difficulty }));
  }

  if (path === "/api/tutorials/categories" && method === "GET") {
    return jsonResponse(tutorialSearch.getCategories());
  }

  const tutorialMatch = path.match(/^\/api\/tutorials\/([\w-]+)$/);
  if (tutorialMatch && method === "GET") {
    const tutorial = tutorialSearch.get(tutorialMatch[1]);
    return tutorial ? jsonResponse(tutorial) : jsonResponse({ error: "Tutorial not found" }, 404);
  }

  // Serve static files from public/
  if (path === "/" || path === "/index.html") {
    const r = await fetch(new URL("/app.html", url.origin));
    return new Response(r.body, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

export default {
  fetch: handleRequest,
};
