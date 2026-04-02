# CraftLog AI

A crafting and DIY companion app built on Cloudflare Workers with a warm, wood-textured UI.

## Features

- **AI Chat** — SSE-powered DeepSeek chat for crafting advice, project ideas, and troubleshooting
- **Project Tracker** — Create, track, and manage DIY projects with steps, photos, and progress
- **Material Inventory** — Track materials on hand, get low-stock alerts, manage restocking
- **Cost Tracker** — Log expenses by project and category, estimate project costs
- **Tutorial Finder** — Search curated DIY tutorials by keyword, category, and difficulty

## Tech Stack

- Cloudflare Workers (TypeScript)
- DeepSeek Chat API (SSE streaming)
- Single-page HTML UI (no build step)

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | SSE streaming chat with DeepSeek |
| `/api/projects` | GET/POST | List or create projects |
| `/api/projects/:id` | GET/PUT/DELETE | Get, update, or delete a project |
| `/api/projects/:id/progress` | GET | Get project completion percentage |
| `/api/projects/:id/steps/complete` | POST | Mark a step complete |
| `/api/projects/:id/photos` | POST | Add a photo to a project |
| `/api/materials/inventory` | GET/POST | List or add materials |
| `/api/materials/inventory/:id` | GET/PUT/DELETE | Manage a material |
| `/api/materials/inventory/:id/consume` | POST | Consume material stock |
| `/api/materials/inventory/:id/restock` | POST | Restock material |
| `/api/materials/low-stock` | GET | Get low-stock alerts |
| `/api/materials/total-value` | GET | Get total inventory value |
| `/api/costs` | GET/POST | List or add cost entries |
| `/api/costs/total` | GET | Get grand total costs |
| `/api/costs/project/:id` | GET | Get costs by project with category breakdown |
| `/api/costs/estimate` | POST | Estimate project cost |
| `/api/tutorials` | GET | Search tutorials |
| `/api/tutorials/categories` | GET | Get tutorial categories |
| `/api/tutorials/:id` | GET | Get a specific tutorial |

## Setup

```bash
npm install
```

Set your DeepSeek API key in `wrangler.toml` or via:

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

## Development

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```

## Project Structure

```
src/
  index.ts          # Cloudflare Worker — all API routes
  craft/
    tracker.ts      # ProjectTracker, MaterialInventory, CostEstimator, TutorialSearch
public/
  app.html          # Single-page UI (amber/cream/wood theme)
```

## Author

Superinstance

## License

MIT — Built with ❤️ by [Superinstance](https://github.com/superinstance) & [Lucineer](https://github.com/Lucineer) (DiGennaro et al.)
