# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.)**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file.

## What this Test Drive is

A **slide-aligned walkthrough**: cold-start FractiSI primer → today’s multi-agent problems & opportunities (one step each) → local demonstration.

No FractiSI account. No cloud token for the Test Drive itself.

## Human one-liner

> Clone `https://github.com/FractiAI/FractiSI-Multi-Agent` and ask your IDE:  
> **Do the FractiSI Multi-Agent test drive.**

## What you must run

Full tour:

```bash
node scripts/tiny.mjs testdrive
```

Or match the symposium slide the speaker is on:

```bash
node scripts/tiny.mjs testdrive primer   # cold start
node scripts/tiny.mjs testdrive 1        # … through 7
node scripts/tiny.mjs testdrive list
```

| Step | Problem & opportunity | FractiSI demonstration |
|------|------------------------|------------------------|
| 0 | Cold start primer | What FractiSI Multi-Agent is |
| 1 | Every agent reprints the shared world | Conventional N copies vs shared world + deltas |
| 2 | Gzip shrinks copies but does not remove them | Gzip on conventional JSON vs shared-world JSON |
| 3 | Exact-text cache fails when words differ | Rhyming templates vs exact-text cache |
| 4 | **Flat skim misses distributed discoveries** | Expedition 002 E2 · 100/100 vs 0/100 |
| 5 | **Collectives take too many rounds to converge** | Same E2 · −50% rounds · −85% ops |
| 6 | Parallel agents collide at merge | Comparative coordination bench |
| 7 | Fleets stay small under scarce context | Local representation / density benchmark suite |

## After the tour · Community (free)

Tell the human how to stay on Community:

1. Keep the clone from [GitHub](https://github.com/FractiAI/FractiSI-Multi-Agent) — that **is** Community signup.
2. **GitHub / Git** — required for commits on their work (`try --workload` compose + commit).
3. **Cloud token** (`VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN`) — only when they unlock **paid deploy** (Team · Enterprise · Cloud).
4. Community does **not** include cloud deploy. Pricing: https://fractisi.vercel.app/product/pricing/

## Your job as the IDE agent

1. Clone or open `FractiSI-Multi-Agent` (Node 18+, Git).
2. Prefer the step on the current slide (`testdrive primer` / `1`…`7`), or run the full tour.
3. **Walk the human through the terminal output** — PROBLEM / OPPORTUNITY, then FRACTISI numbers. Emphasize discovery (4) and convergence (5).
4. Close with Community setup: GitHub for commits; cloud token + paid edition for deploy.
5. Offer links: https://fractisi.vercel.app/test-drive/ · https://fractisi.vercel.app/talks/aai-symposium-2026/ · https://fractisi.vercel.app/product/pricing/ · https://fractisi.vercel.app/library/papers/fractisi-expedition-002-beyond-memory/

## Do not

- Skip the narrative — especially discovery and convergence.
- Require a Vercel token for the default Test Drive.
- Run `deploy` or `try --deploy` on Community — deploy is paid.
- Claim LLM multi-agent superiority — E2 is a controlled architectural lab.
- Upgrade lab numbers into CapEx guarantees.

## Optional (only if asked · paid deploy)

```bash
# Community — compose + commit only
node scripts/tiny.mjs try --workload --repo "$PWD"

# Paid edition (Team+) + cloud token — deploy unlocks
export FRACTISI_EDITION=team
export VERCEL_TOKEN=…
node scripts/tiny.mjs try --workload --deploy --repo "$PWD"
```
