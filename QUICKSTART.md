# Quickstart — FractiSI Multi-Agent

## IDE Test Drive (recommended for symposium / first try)

1. Clone `https://github.com/FractiAI/FractiSI-Multi-Agent`
2. Ask your IDE: **Do the FractiSI Multi-Agent test drive.**

It will follow [`TEST_DRIVE.md`](./TEST_DRIVE.md) and run `node scripts/tiny.mjs testdrive` (primer → seven problem/opportunity demos). No cloud token. No FractiSI account.

Match a live talk slide:

```bash
node scripts/tiny.mjs testdrive primer
node scripts/tiny.mjs testdrive 1   # … through 7
```

## Community (free) · sign up & set up

1. **GitHub clone** — keeping this repo **is** Community signup.
2. **Node.js 18+** and **Git**.
3. **GitHub credentials** — required for Git commits on your work.
4. **Cloud token** (`VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN`) — only when you unlock **paid deploy**.

Community includes local Test Drive, labs, compose, and Git commits. **Cloud deploy is a paid feature** (Team · Enterprise · Cloud).

## Real workload (Community — no deploy)

```bash
node scripts/tiny.mjs try --workload --repo "$PWD"
```

Compose + git commit only.

## Paid deploy (Team+)

```bash
export FRACTISI_EDITION=team          # or enterprise | cloud
export VERCEL_TOKEN=…                 # or FRACTISI_CLOUD_TOKEN
node scripts/tiny.mjs try --workload --deploy --repo "$PWD"
# or: node scripts/tiny.mjs deploy create|approve|run
```

Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens). Pricing: [/product/pricing/](./product/pricing/).

## What to expect

After Community `try --workload` you should have:

- Parallel **agent worktrees** instead of one crowded working tree  
- A **composed** contribution set  
- A real **Git commit** of the integrated result  

Paid editions can add a **live cloud preview URL** after approval-gated deploy.

| Ability | Command / layer | Edition |
|---------|-----------------|---------|
| See ownership & interference | `status` · coordination | Community+ |
| Propose then compose | `propose` → `compose` → `repo integrate` | Community+ |
| Approval-gated ship | `deploy create` → `approve` → `run` | **Paid** (Team+) |
| Denser shared context | Tiny Footprint demos / benchmarks | Community+ |
| Stay in your IDE | Cursor / Claude Code / VS Code adapters | Community+ |

### Local labs only

```bash
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

### Optional

```bash
node scripts/tiny.mjs join             # industry testing signup
```

Full detail: [docs/install/INSTALL.md](./docs/install/INSTALL.md) · product story: [README.md](./README.md).

Tiny Footprint remains the Layer A execution core inside FractiSI Multi-Agent.
