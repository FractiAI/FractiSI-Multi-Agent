# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.)**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file.

## What this Test Drive is

A **guided walkthrough**: today’s multi-agent problems → how FractiSI Multi-Agent addresses each one → a **local demonstration** you run on their machine.

No FractiSI account. No cloud token.

## Human one-liner

> Clone `https://github.com/FractiAI/FractiSI-Multi-Agent` and ask your IDE:  
> **Do the FractiSI Multi-Agent test drive.**

## What you must run

```bash
node scripts/tiny.mjs testdrive
```

That command narrates and demonstrates:

| # | Today’s problem | FractiSI demonstration |
|---|-----------------|------------------------|
| 1 | Every agent reprints the shared world | Conventional N copies vs shared world + deltas |
| 2 | Gzip shrinks copies but does not remove them | Gzip on conventional JSON vs shared-world JSON |
| 3 | Exact-text cache fails when words differ | Rhyming templates vs exact-text cache (40 sessions) |
| 4 | Parallel agents collide at merge | Comparative coordination bench (conventional vs FractiSI) |
| 5 | Fleets stay small under scarce context | Local representation / density benchmark suite |

## Your job as the IDE agent

1. Clone or open `FractiSI-Multi-Agent` (Node 18+, Git).
2. Run `node scripts/tiny.mjs testdrive`.
3. **Walk the human through the terminal output** — for each PROBLEM section, restate the pain in plain language; for each FRACTISI section, point at the measured numbers that just printed.
4. When it finishes, summarize the five problems and five answers in a short closing note.
5. Offer links: https://fractisi.vercel.app/product/ · https://fractisi.vercel.app/talks/aai-symposium-2026/ · https://fractisi.vercel.app/test-drive/

## Do not

- Skip the narrative — the point is problem → solution, not a silent benchmark dump.
- Require a Vercel token for the default Test Drive.
- Upgrade lab numbers into CapEx guarantees or production fleet claims.
- Stop early on “pin withheld” / GPU `not_run` if the problem tour already printed — explain those as host limits, not tour failure.

## Optional (only if asked)

```bash
node scripts/tiny.mjs try --workload --repo "$PWD"
export VERCEL_TOKEN=… && node scripts/tiny.mjs try
```
