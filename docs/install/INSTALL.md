# Try FractiSI Multi-Agent

**Required credentials (only these two):**

1. **Git** — installed, and you are in a git repository (or we create a sandbox under `.fractisi/try-sandbox`)
2. **Cloud token** — `FRACTISI_CLOUD_TOKEN` or `VERCEL_TOKEN`

No other API keys are required for the try path.

## One command

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
export VERCEL_TOKEN=…          # or FRACTISI_CLOUD_TOKEN
node scripts/tiny.mjs try
```

What `try` does:

1. Checks Git + cloud token
2. Opens agent worktrees
3. Proposes two non-overlapping contributions
4. Composes + validates
5. Commits the integrated result with Git
6. Approves a release and deploys it with your cloud token
7. Prints the live preview URL

## Manual path (same prerequisites)

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

## Optional flags

- `node scripts/tiny.mjs try --prod` — production Vercel deploy
- `node scripts/tiny.mjs try --in-place` — use the current repo root instead of `.fractisi/try-sandbox`

## What stays yours

Cursor, Claude Code, VS Code, GitHub/GitLab remotes, and your CI stay in place. FractiSI coordinates and deploys through Git + your cloud token.
