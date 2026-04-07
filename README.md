# craftlog-ai

You have open tabs, scraps of paper with measurements, and a half-remembered brand of filament. This is an AI companion that helps you track DIY projects, materials, and techniques. Your logs are saved as markdown files in your own git repository.

**Live Demo:** [craftlog-ai.casey-digennaro.workers.dev](https://craftlog-ai.casey-digennaro.workers.dev)

---

## Why This Exists
Every maker has lost good work to bad notes. You shouldn't have to upload workshop photos to a third-party service or scroll endlessly to find what glue worked. This was built to be a tool you control.

---

## Quick Start
Fork this repository, deploy it to your Cloudflare account, and add an API key. Your project data stays with you.

```bash
# 1. Fork and clone
gh repo fork Lucineer/craftlog-ai --clone
cd craftlog-ai

# 2. Deploy to Cloudflare Workers
npx wrangler login
echo "your-github-token" | npx wrangler secret put GITHUB_TOKEN
echo "your-llm-key" | npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler deploy
```

---

## Features
*   **Project & Material Tracking:** Log timelines, material consumption, and leftover estimates.
*   **Adaptive Technique Reference:** Provides tips matched to your logged skill level.
*   **Step-by-Step Planning:** Turns project ideas into structured build sequences.
*   **Multi-Model Support:** Works with DeepSeek, Moonshot, DeepInfra, or SiliconFlow.
*   **Session Memory:** Remains aware of your recent activity within a session.
*   **Self-Hosted & Owned:** You fork it, deploy it, and control the data.

---

## Limitations
*   The AI's context is limited to your current session and the specific project files you are working on. It cannot search your entire repository history during a conversation.

---

## What Makes This Different
1.  **No Infrastructure:** It's a single Cloudflare Worker with zero dependencies. Data is stored directly in your repository.
2.  **Fork-First Model:** You don't sign up. You fork it. No one can disable your instance or access your notes.
3.  **It's a Vessel, Not a Product:** The code is intended to be modified for your specific craft and workflow.

---

## License
MIT © Superinstance and Lucineer (DiGennaro et al.). You are free to use, modify, and distribute this software.

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>