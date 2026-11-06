# Quickstart — FractiSI Multi-Agent

## What you need

1. **Git**
2. **Cloud token** — `VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN` (create at [vercel.com/account/tokens](https://vercel.com/account/tokens))
3. **Node.js 18+**

Nothing else for the end-to-end try.

## Install

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
```

## Use

```bash
export VERCEL_TOKEN=…          # or: export FRACTISI_CLOUD_TOKEN=…
node scripts/tiny.mjs try
```

You get a live preview URL when it finishes (worktrees → compose → git commit → cloud deploy).

## What to expect

After `try` you should have:

- Parallel **agent worktrees** instead of one crowded working tree  
- A **composed** contribution set, not two dangling patches  
- A real **Git commit** of the integrated result  
- A **live cloud preview URL** from your own token  

Ongoing upgrades to your workflow:

| Ability | Command / layer |
|---------|-----------------|
| See ownership & interference | `status` · coordination |
| Propose then compose | `propose` → `compose` → `repo integrate` |
| Approval-gated ship | `deploy create` → `approve` → `run` |
| Denser shared context | Tiny Footprint demos / benchmarks |
| Stay in your IDE | Cursor / Claude Code / VS Code adapters |

### Without a cloud token (local only)

```bash
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

Deploy and full `try` still need the token.

### Optional

```bash
node scripts/tiny.mjs try --prod       # production Vercel deploy
node scripts/tiny.mjs try --in-place   # use current repo root
node scripts/tiny.mjs join             # industry testing signup
```

Full detail: [docs/install/INSTALL.md](./docs/install/INSTALL.md) · product story: [README.md](./README.md).

Tiny Footprint remains the Layer A execution core inside FractiSI Multi-Agent.
