# FractiSI · Multi-Agent package surface

This folder is the **FractiSI Multi-Agent** installable configuration / SDK entry inside the Workstation kit.

**Flagship product:** FractiSI Multi-Agent  
**Core technology:** Tiny Footprint (see `../tiny-footprint/`) · Tiny Gateway engine  
**Full product README (start here):** [`../README.md`](../README.md)

## Install and use

Clone the kit, then pick a path:

### Real workload on your repo (deploy optional)

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
# from YOUR project:
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --repo "$PWD"
```

Git only → capture changes → compose → **local git commit**.  
Cloud preview only when you want it:

```bash
export VERCEL_TOKEN=…   # or FRACTISI_CLOUD_TOKEN
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --deploy --repo "$PWD"
```

### Sandbox demo

```bash
cd FractiSI-Multi-Agent
export VERCEL_TOKEN=…          # or: try --no-deploy
node scripts/tiny.mjs try
```

## What to expect

| Ability | Layer |
|---------|-------|
| Shared-world density (one context, per-agent deltas) | A · Tiny Footprint |
| Coordination / ownership / interference checks | B |
| Composition · validate · integrate · rollback | D |
| Git worktrees / scoped workspaces | E |
| Approval-gated deploy (**optional**) | F |
| Beside Cursor / Claude Code / VS Code | Adapters |

## Layout here

| Path | Role |
|------|------|
| `configuration/` | FractiSI Multi-Agent config templates |
| `sdk/` | Package SDK entry points |
| `../scripts/tiny.mjs` | CLI (`try`, `capture`, `compose`, `deploy`, …) |
| `../src/platform/` | Layers A–F implementation |
| `../tiny-footprint/` | Tiny Footprint core surface |
| `../product/` | Marketing product hub (site) |

Site: https://fractisi.vercel.app · Kit: https://github.com/FractiAI/FractiSI-Multi-Agent

→ ∞^∞
