# Insanely Useful Bots

A curated, **verified** directory of the best real AI agents, Claude Agent Skills, and MCP servers for businesses and startups — [insanelyusefulbots.com](https://www.insanelyusefulbots.com).

**568 hand-checked listings** across three collections:

| Collection | Count | What it is |
|---|---|---|
| **AI Agents** | 173 | Production AI agents for support, sales, coding, marketing, ops, healthcare, legal, and more |
| **Agent Skills** | 145 | Real Claude / Agent Skills (SKILL.md) from Anthropic, the community, and Composio |
| **MCP Servers** | 250 | Model Context Protocol servers, ranked by GitHub stars |

## Principles

- **No hallucination.** Every URL was verified live (HTTP 200) before inclusion.
- **Real metadata.** GitHub star counts are scraped from the live repositories (validated against the GitHub API). Shown on each card and sortable.
- **Sourced.** MCP servers are parsed deterministically from the `awesome-mcp-servers` lists; skills from the official `anthropics/skills`, `obra/superpowers`, `ComposioHQ/awesome-claude-skills`, and verified community repos.

## Features

- Three tabbed collections with a sticky search + nav bar
- Left sidebar category filters (per collection)
- Sort by curated order, most GitHub stars, or name
- Real favicons (GitHub org avatars + DuckDuckGo) with monogram fallback
- Fully responsive, dark glassmorphism UI with film-grain texture

## Tech

Pure static site — no build step. Plain HTML, CSS, and vanilla JS.

```
index.html      # markup
styles.css      # styles
app.js          # rendering, search, filter, sort
data.js         # AI agents data (window.AGENTS)
skills.js       # Agent Skills data (window.SKILLS)
mcp.js          # MCP servers data (window.MCP)
```

### Run locally

```bash
python3 -m http.server 4178
# open http://localhost:4178
```

## Disclaimer

Logos and trademarks belong to their respective owners. Not affiliated with the listed projects. Built for discovery, not endorsement.
