# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.)**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file and stop when it is done.

## Goal

Run the local Test Drive end-to-end on their machine. No FractiSI account. No cloud token required.

## Steps (do these)

1. Confirm you are in the `FractiSI-Multi-Agent` repo root (clone from `https://github.com/FractiAI/FractiSI-Multi-Agent` if needed).
2. Require **Node.js 18+** and **Git**. If missing, tell the human how to install them, then continue.
3. Run:

```bash
node scripts/tiny.mjs testdrive
```

That single command runs: `doctor` → `install` → `demo` → `benchmark` → `report`.

4. Show the human a short summary of what passed (or the first failure and how to fix it).
5. Point them at:
   - Product: https://fractisi.vercel.app/product/
   - Talk: https://fractisi.vercel.app/talks/aai-symposium-2026/
   - Hub: https://fractisi.vercel.app/test-drive/

## Do not

- Do not require a Vercel / cloud token for the default Test Drive.
- Do not invent product claims beyond what the command output and `README.md` / `docs/` already say.
- Do not skip failing steps — stop and explain.

## Optional (only if the human asks)

```bash
node scripts/tiny.mjs try --workload --repo "$PWD"
# cloud preview with THEIR token:
export VERCEL_TOKEN=…
node scripts/tiny.mjs try
```

## Human one-liner

> Clone `https://github.com/FractiAI/FractiSI-Multi-Agent` and ask your IDE: **Do the FractiSI Multi-Agent test drive.**
