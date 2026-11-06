# Install and use — FractiSI Multi-Agent

This is the user-facing install guide. After you provide **Git** and a **cloud token**, the product path is one command.

## Prerequisites (transparent)

| Required for | Need |
|--------------|------|
| Full `try` (compose + commit + **live preview**) | Git + Node 18+ + `VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN` |
| Local demos / benchmarks only | Git + Node 18+ (no cloud token) |

**Not required:** Cursor API key, Claude key, OpenAI key, GitHub fine-grained PAT (unless you push remotes yourself), Docker.

### How to create the cloud token

1. Create or sign in to a [Vercel](https://vercel.com) account.
2. **Account Settings → Tokens → Create**.
3. Copy the token into your shell:

```bash
export VERCEL_TOKEN=…                 # preferred
# or
export FRACTISI_CLOUD_TOKEN=…         # same effect
```

The CLI reads the env var and sends it only to Vercel’s API for deploy. It does not commit the token into the repo.

## Install

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
```

Optional: `code .` or `cursor .` to open the Workstation in an IDE.

## Use — full product path

```bash
export VERCEL_TOKEN=…
node scripts/tiny.mjs try
```

Expected result: a printed **preview URL**. Open it.

`try` steps:

1. Verify Git + cloud token  
2. Open agent worktrees  
3. Propose two non-overlapping contributions  
4. Compose + validate  
5. Git-commit the integrated result  
6. Approve a release and deploy with your token  
7. Print the live URL  

### Flags

| Flag | Meaning |
|------|---------|
| `--prod` | Production Vercel deploy instead of preview |
| `--in-place` | Use the current repo root instead of `.fractisi/try-sandbox` |

## What to expect

Once Git and a cloud token are in place, FractiSI Multi-Agent upgrades the *shape* of agentic work — not just the install ritual:

1. **Shared-world density** — Tiny Footprint keeps organizational context once; agents carry deltas. Same box, more concurrent agents before memory becomes the bottleneck.
2. **Coordination before collision** — agents register, own tasks, and get interference warnings when paths overlap.
3. **Composition instead of merge archaeology** — contributions are evaluated, validated, integrated, and roll-backable into one result.
4. **Git-native parallelism** — scoped worktrees so parallel agents do not require a branch-per-agent tax.
5. **Approval-gated deploy** — a release candidate only goes live after composition validates and you approve; your token publishes the preview.
6. **IDE coexistence** — works beside Cursor, Claude Code, and VS Code; remotes and CI stay yours.

The first `try` run demonstrates all of that in one sitting and ends on a **live preview URL**.

Day-two commands: `status`, `propose`, `compose`, `repo integrate`, `deploy create|approve|run`, plus local `demo` / `benchmark` / `report` without a token.

**Limits:** real Git + Vercel when a token is present; structured-state lab receipts unless labeled otherwise; not a CapEx or frontier-LLM guarantee.

## Use — manual steps (same credentials)

```bash
export VERCEL_TOKEN=…
node scripts/tiny.mjs init
node scripts/tiny.mjs agents register alice native
node scripts/tiny.mjs agents register bob native
node scripts/tiny.mjs propose <aliceId> agents/alice/note.txt "hello"
node scripts/tiny.mjs propose <bobId> agents/bob/note.txt "hello"
node scripts/tiny.mjs compose
node scripts/tiny.mjs repo integrate
node scripts/tiny.mjs deploy create
node scripts/tiny.mjs deploy approve <releaseId>
node scripts/tiny.mjs deploy run <releaseId>
```

## Use — local labs (no cloud token)

```bash
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

## What stays yours

Cursor, Claude Code, VS Code, GitHub/GitLab remotes, and your CI stay in place. FractiSI coordinates and deploys through Git + your cloud token beside them.

## Honesty

`try` is an in-process platform demo that performs real Git worktree/commit operations and a real Vercel deploy when a token is present. It is not a claim about GPU HBM CapEx or a multi-vendor LLM bake-off. Tiny Footprint (ENGINE_SHELF peer in the research corpus) remains Layer A inside this product.
