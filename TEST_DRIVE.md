# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.)**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file.

## What this Test Drive is

A **product-aligned walkthrough** of the real FractiSI Multi-Agent stack. Primer = plain-English first listen **inside** the Test Drive ([`/test-drive/self-paced/#primer`](https://fractisi.vercel.app/test-drive/self-paced/#primer)) — do not send the audience to the product page for it. Framed for the Applied Active Inference Symposium as a **possible rhyme** with Active Inference: **humans are agents too** in a shared world (**not** framework identity).

**Primer (plain English, inside Test Drive):** Generative possibility → Net Zero → Φ_EGS → Infinite Octaves → Boundary nodes → Recursive trees / holographic rhyme → 3D Hexagon / eight-node · honeycomb → Wave–Node–Fq / nested vectors / interference → Awareness → Rhyming Templates → Tiny Gateway → Tiny Footprint → Layers B–F → FractiSI Multi-Agent. Self-paced opens on `/test-drive/self-paced/#primer` — do not send the audience to the product page for the primer.

Then live labs:

1. **Tiny Footprint** — shared world + deltas  
2. **Tiny Footprint** after gzip  
3. **Tiny Gateway · Rhyming Templates** vs exact cache (Net Zero → octaves)  
4–5. **Selective reconstruction** — discovery / convergence  
6. **Layers B–D** — coordination · shared state · composition  
7. **Density · E Git · F deploy (paid)**

No FractiSI account. No cloud token for the Test Drive itself.

**Self-paced (no IDE):** https://fractisi.vercel.app/test-drive/self-paced/ — trainer-style lessons: plain teaching → Run → takeaway → Previous / Next (keys ← → and R). Live results via `/api/testdrive`. Hub: https://fractisi.vercel.app/test-drive/

## Human one-liner

> Clone `https://github.com/FractiAI/FractiSI-Multi-Agent` and ask your IDE:  
> **Do the FractiSI Multi-Agent test drive.**

## What you must run

```bash
node scripts/tiny.mjs testdrive
```

Or match the symposium / self-paced step:

```bash
node scripts/tiny.mjs testdrive primer   # product cold start
node scripts/tiny.mjs testdrive 1        # … through 7
node scripts/tiny.mjs testdrive list
```

| Step | Product focus | Live lab |
|------|---------------|----------|
| 0 | Product map · Infinite Octaves → Tiny Footprint · Layers B–F | Primer narrative |
| 1 | **Tiny Footprint** shared world + deltas | N copies vs shared+deltas |
| 2 | **Tiny Footprint** after gzip | Gzip residual |
| 3 | **Tiny Gateway · Rhyming Templates** vs exact cache | Rhyme vs exact-text (Net Zero → octaves) |
| 4 | **Selective reconstruction · discovery** | Exp 002 E2 · 100/100 vs 0/100 |
| 5 | **Selective reconstruction · convergence** | −50% rounds · −85% ops |
| 6 | **Layers B–D** coordination · shared state · composition | Comparative arms A vs C |
| 7 | **Density · Layer E Git · Layer F deploy (paid)** | Density + Community close |

## After the tour · Community (free)

1. Keep the GitHub clone — that **is** Community signup.  
2. **GitHub / Git** — Layer E commits on their work.  
3. **Cloud token** — only when unlocking **paid Layer F deploy** (Team · Enterprise · Cloud).  
4. Pricing: https://fractisi.vercel.app/product/pricing/

## Your job as the IDE agent

1. Clone or open `FractiSI-Multi-Agent` (Node 18+, Git).  
2. Run `testdrive` (full) or the step on the current slide / self-paced card.  
3. **Name the components out loud** as they print — Infinite Octaves, Rhyming Templates, Tiny Gateway, Tiny Footprint, Tiny Footprint · Layers B–F.  
4. Emphasize step 3 (rhyme) and steps 4–5 (discovery / convergence).  
5. Close with Community setup and paid Layer F deploy.  
6. Offer links: self-paced · talk · Tiny Gateway paper · Tiny Footprint paper · pricing · Exp 002.

## Do not

- Skip Rhyming Templates / Infinite Octaves / layer names.  
- Require a Vercel token for the default Test Drive.  
- Run `deploy` / `try --deploy` on Community — Layer F is paid.  
- Claim LLM multi-agent superiority — E2 is a controlled architectural lab.  
- Upgrade lab numbers into CapEx guarantees.  
- Call Infinite Octaves “infinite physical tiers.”

## Optional (only if asked · paid Layer F)

```bash
export FRACTISI_EDITION=team
export VERCEL_TOKEN=…
node scripts/tiny.mjs try --workload --deploy --repo "$PWD"
```
