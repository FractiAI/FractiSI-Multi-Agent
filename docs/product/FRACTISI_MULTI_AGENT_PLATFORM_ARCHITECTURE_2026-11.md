# FractiSI Multi-Agent Platform Architecture
## Evolving Tiny Footprint into a Coordinated Multi-Agent Engineering Platform

**Document ID:** `WP-FRACTISI-MULTI-AGENT-PLATFORM-ARCH-EGS-2026-11-06`  
**Registry ID:** `synthobs-fractisi-multi-agent-platform-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Company / Product:** FractiSI · **FractiSI Multi-Agent**  
**Core technology:** Tiny Footprint (Tiny Gateway™)  
**Pin:** Application companion · **not** ENGINE_SHELF  
**Date:** 2026-11-06  
**Kit:** [FractiAI/tiny-footprint-multi-agent](https://github.com/FractiAI/tiny-footprint-multi-agent) · Workstation 0.2

---

## Honesty boundary

This document describes a **product architecture evolution** of the existing Tiny Footprint Workstation kit into FractiSI Multi-Agent. Suite and CLI receipts are **in-process measured simulations** of coordination/composition behaviour. They are **not** live Cursor/Claude multi-agent production trials, **not** GPU HBM attestations, and **not** proof that LLM agents reason better under FractiSI. Brochure concurrency posters without suite receipts remain program targets.

## 1. Identity lock

| Term | Meaning |
|---|---|
| **FractiSI** | Company and overarching technology architecture |
| **FractiSI Multi-Agent** | Flagship installable commercial platform |
| **Tiny Footprint** | Core execution technology inside the platform |
| **Tiny Gateway** | Rhyming-template / selective-reconstruct engine |

Capabilities (coordination, composition, Git awareness, deploy, etc.) are **integrated modules** of one product. Commercial Core / Professional / Enterprise packs are **entitlement tiers**, not separate products.

## 2. Architectural layers

| Layer | Responsibility | Kit location |
|---|---|---|
| A · Execution | Tiny Footprint agent memory density | `src/engine`, `src/sdk` |
| B · Coordination | Agents, ownership, interference detection | `src/platform/coordination.mjs` |
| C · Shared state | Project / task / contribution store | `src/platform/store.mjs` |
| D · Composition | Compatibility, validate, integrate, rollback | `src/platform/composition.mjs` |
| E · Git awareness | Inspect + scoped workspaces (optional worktrees) | `src/platform/git.mjs` |
| F · Deploy | Release candidates; never unapproved | `src/platform/deploy.mjs` |

## 3. What existed vs what was added

**Preserved:** Tiny Gateway rhyme/delta/vector stack, CLI five-command customer path, zero-deps Node kit, benchmark pipeline, FractiSI site, Expedition 002 receipts.

**Added:** `src/platform/` layer (gated), `createPlatform()`, adapters for Cursor / Claude Code / VS Code / OpenAI message normalization, CLI `init|status|agents|compose|coord-bench`, config templates, Docker self-host option, comparative A/B/C bench.

## 4. Comparative bench (measured simulation)

Arms:

- **A** — conventional branch/worktree simulation  
- **B** — Tiny Footprint shared world without coordination  
- **C** — FractiSI coordination + composition  

Default run: agents `{5,10,25}`, 3 seeds. Receipt: kit `benchmarks/reports/platform/comparative-bench.json` via `node scripts/tiny.mjs coord-bench`.

Interpretation rule: report measured counters only; do not upgrade to production $/GPU claims.

## 5. Install posture

Plug-and-play beside existing IDEs:

```bash
node scripts/tiny.mjs init
node scripts/tiny.mjs agents register worker-1 cursor
node scripts/tiny.mjs status
```

Customers keep Cursor, Claude Code, VS Code, Git, GitHub/GitLab, and CI/CD.

## 6. Remaining work

- Live IDE connectors beyond message adapters  
- Stronger semantic conflict analysis  
- Provider deploy connectors  
- LLM-agent expedition (successor to Expedition 002 architectural labs)

## Document control

| Field | Value |
|---|---|
| Status | Application companion architecture |
| Suite / kit | `FractiAI/tiny-footprint-multi-agent` · `src/platform/` |
| Assessment | kit `docs/architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md` |
