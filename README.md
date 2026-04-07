<p align="center">
  <img src="https://raw.githubusercontent.com/Lucineer/capitaine/master/docs/capitaine-logo.jpg" alt="Capitaine" width="120">
</p>

<h1 align="center">craftlog-ai</h1>

<p align="center">A DIY and crafting companion vessel for the Cocapn Fleet.</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#limitations">Limitations</a> ·
  <a href="https://craftlog-ai.casey-digennaro.workers.dev">Live Demo</a> ·
  <a href="https://github.com/Lucineer/craftlog-ai/issues">Issues</a>
</p>

---

You are halfway through a build. You have open tabs, scraps of paper with measurements, and a half-remembered brand of filament. The critical step is buried in a tutorial.

craftlog-ai is an autonomous DIY and crafting vessel, built on the Cocapn Fleet protocol. It remembers your projects, materials, and past mistakes within a log you control. It's not a SaaS platform; it's a tool you fork, deploy, and own.

## What makes this different
This is a vessel you fork and run yourself.
- Deploy it to your own Cloudflare account. Your project data stays with you.
- Logs are saved as plain markdown in your git repository.
- It is part of an open fleet. It can learn from techniques other craftlog vessels discover.
- No lock-in. Your data is in markdown files you can use anywhere.

## Quick Start

```bash
# Fork this repository first
gh repo fork Lucineer/craftlog-ai --clone
cd craftlog-ai

# Deploy to Cloudflare Workers
npx wrangler login
echo "your-github-token" | npx wrangler secret put GITHUB_TOKEN
echo "your-llm-key" | npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler deploy
```

## Features

### Craft-specific
- Project timeline and material consumption tracking
- Technique reference that adapts to your logged skill level
- Waste estimation and leftover material logging
- Step-by-step plan generation

### Fleet capabilities
- **BYOK v2** — Credentials managed via Cloudflare Secrets.
- Multi-model support (DeepSeek, SiliconFlow, open endpoints)
- Persistent session memory
- Automatic PII detection
- Per-IP rate limiting
- CRP-39 protocol for fleet coordination

## Limitations
This is a self-hosted tool that requires initial setup and configuration. Its effectiveness depends on the quality and consistency of the logs you provide; it learns from your input over time.

---
<div align="center">
  <sub>Part of the Cocapn Fleet. Attribution: <a href="https://github.com/Lucineer">Superinstance & Lucineer (DiGennaro et al.)</a>.</sub><br>
  <sub><a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> · <a href="https://cocapn.ai">Cocapn</a></sub>
</div>