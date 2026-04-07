<p align="center">
  <img src="https://raw.githubusercontent.com/Lucineer/capitaine/master/docs/capitaine-logo.jpg" alt="Capitaine" width="120">
</p>

<h1 align="center">craftlog-ai</h1>

<p align="center">A companion for your craft and DIY projects.</p>

<p align="enter">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#the-fleet">The Fleet</a> ·
  <a href="https://github.com/Lucineer/craftlog-ai/issues">Issues</a>
</p>

---

You know that feeling. Half-finished projects on the shelf, multiple browser tabs open, supplies scattered. You don't need another checklist; you need a craft companion. This is that.

craftlog-ai is an open AI companion that remembers your work, tracks your supplies, and helps with techniques. It lives in this repository.

## Why this exists

Most craft apps are just inventory lists. This was built for makers who want a tool that learns how they work, without subscriptions or data collection.

---

**Powered by [Capitaine](https://github.com/Lucineer/capitaine) · [Cocapn](https://github.com/Lucineer/cocapn)**

This repository is the agent. craftlog-ai is a Cocapn vessel—a self-contained repository that runs on Cloudflare Workers and coordinates with a fleet through git. MIT licensed.

## What this does

✅ You own it. Fork once, deploy once, it's yours.
✅ Your data lives in your git repo.
✅ Runs on Cloudflare Workers (free tier).
✅ Updates available from the fleet when you want them.
✅ Your projects are private.

## Quick Start

1. Fork this repository.
2. Deploy to Cloudflare Workers:
```bash
cd craftlog-ai
npx wrangler login
echo "your-github-token" | npx wrangler secret put GITHUB_TOKEN
echo "your-llm-key" | npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler deploy
```

## Features

- **Project Memory:** Records steps, materials, and notes.
- **Supply Tracking:** Warns when stock is low.
- **Adaptive Instructions:** Adjusts guidance to your skill level.
- **PII Safety:** Removes sensitive data before LLM calls.
- **Session Memory:** Builds context over time.
- **Fleet Updates:** Can receive improvements via the CRP-39 protocol.
- **Simple Deployment:** Single-file Worker, no build step.
- **Multi-Model:** Works with various LLMs.

## Limitation

Requires manual setup of a Cloudflare Worker and API keys. It does not host itself.

## Architecture

Single-file Cloudflare Worker with no runtime dependencies.

```
src/worker.ts    # Main application
lib/
  byok.ts        # Multi-model routing
  memory.ts      # Project memory
  craftlog.ts    # Core logic
```

## The Fleet

craftlog-ai is part of the Cocapn Fleet—a network of autonomous, open-source agents.

<details>
<summary><strong>⚓ See the Fleet</strong></summary>
<br>
This vessel is part of a distributed fleet of open intelligence. Other vessels handle tasks like research, coding, design, and analysis. They communicate via git and shared protocols.
<br><br>
<a href="https://the-fleet.casey-digennaro.workers.dev">View the Fleet Roster</a> · <a href="https://cocapn.ai">Learn about Cocapn</a>
</details>

---

<div align="center">
  <sub>Built by <a href="https://github.com/Lucineer">Lucineer</a> · Part of the <a href="https://the-fleet.casey-digennaro.workers.dev">Cocapn Fleet</a> · <a href="https://cocapn.ai">Cocapn</a></sub>
</div>