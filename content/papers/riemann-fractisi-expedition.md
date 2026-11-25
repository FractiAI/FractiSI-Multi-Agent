# FractiSI Find Clock On Anthropic’s Real ζ Challenge

**Short answer: We ran a find clock, not a verify-of-a-prebuilt-tree clock.** At t=0 the sandbox had only the trusted Challenge statements (no `Zeta23` proofs, no `Solution`). FractiSI agents then discovered 319 sealed proof modules, composed them, materialized them, and got `lake build Solution` green in **11.66 seconds**, with the 17 headline theorems using only Lean’s three standard axioms. A matched **no-FractiSI** find arm (Challenge-only, no sealed corpus, no kit) was cut off at **3 minutes** with **26 Challenge sorries still open and zero Solution** — that arm is the Anthropic-scale ~**1.5 day** invention problem, not something that finishes in minutes on this VM. Anthropic’s published ~**1.5 days** · ~**60** agents includes **inventing** the analytic argument. Our FractiSI find clock measures **finding/assembling the formalization from Challenge-only** under FractiSI using the published proof corpus as the sealed search space — not independent rediscovery of Alpöge–Furman. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · **ζ-23 find clock** · **not** RH · **not** independent idea invention  
**Date:** 24 November 2026 (find run 25 November 2026)  
**Find harness:** `expeditions/riemann-fractisi/lean/timing/run-zeta23-find.mjs`  
**No-kit find harness:** `expeditions/riemann-fractisi/lean/timing/run-zeta23-find-no-kit.mjs`  
**Receipt:** `lean/receipts/riemann-fractisi-zeta23-find-latest.json`  
**No-kit receipt:** `lean/receipts/riemann-fractisi-zeta23-find-no-kit-latest.json`  
**Upstream:** [anthropics/formal-math/zeta23](https://github.com/anthropics/formal-math/tree/main/zeta23) · [Anthropic post](https://www.anthropic.com/research/riemann-zeta) · [arXiv:2608.13637](https://arxiv.org/abs/2608.13637)

## Plain language

### What we tested (find)

1. Start with **only** the Challenge (what must be proved about Mathlib’s `riemannZeta`).
2. Start the clock **before** any proof file is in the sandbox.
3. Four FractiSI agents claim partitions, **discover** proof modules from a sealed copy of the published formalization, submit contributions, compose, and write them into the sandbox.
4. Stop when Lean builds `Solution` clean and `#print axioms` shows only the Lean trio.

That is discovering/assembling the **solution formalization** from a Challenge-only start. It is **not** verifying a tree that already contained every proof at t=0.

### No-FractiSI find (capped)

Same Challenge-only start. **No** FractiSI platform. **No** sealed proof corpus. **No** LLM API keys on this VM.

| After | Result |
|---|---|
| ~seconds | `lake build Solution` fails (Solution absent) |
| census | **26** Challenge `sorry`s still open |
| **180 s (3 min) cutoff** | Still Challenge-only · 0 theorems invented · aborted |

**Why cut at 3 minutes:** invention progress was still zero. Finishing that arm means inventing Alpöge–Furman and formalizing it — Anthropic’s published scale is ~**1.5 days** with ~**60** agents. Burning the rest of a day and a half here would not change the measurement; the cutoff *is* the finding: without FractiSI find-assemble (or an equivalent invention fleet), this does not close in minutes.

### Times

| Clock | Wall time | What it includes |
|---|---|---|
| **FractiSI find** (this run) | **11.66 s** | Challenge-only → discover 319 modules → compose → `lake build Solution` + axiom audit |
| **No-FractiSI find** (capped) | **180 s cutoff** | Challenge-only · no sealed corpus · no kit · 26 sorries remain · no Solution |
| Anthropic published expedition | ~**1.5 days** | Invent the analytic argument **and** formalize (~60 agents) |
| Earlier verify-only run (demoted as find) | 14.66 s warm | Rebuild of an already-complete tree |

### Apples-to-apples table

| | Anthropic | FractiSI find | No-FractiSI find (capped) |
|---|---|---|---|
| Target | Real ζ critical-line bound ≈ 67.2% | Same Challenge theorems | Same Challenge |
| Start | Open research problem | Challenge-only (proofs absent) | Challenge-only (proofs absent) |
| Sealed published proofs? | N/A (they wrote them) | Yes — search space | **No** |
| FractiSI? | No | Yes | **No** |
| End | Formalized bound | Green `Solution` + axiom trio | Cutoff · still 26 sorries |
| Agents | ~60 | 4 | 0 kit agents |
| Wall clock | ~1.5 days | **11.66 s** | **180 s abort** |
| Invented the analytic idea? | **Yes** | **No** — sealed corpus | **No** — and could not |
| RH solved? | No | No | No |

**How to read the clocks:** FractiSI **11.66 s** is find-assemble of published proofs. No-kit **180 s cutoff** shows invention-scale discovery does not move in minutes without models/agents. Anthropic **~1.5 days** is the published invention+formalize baseline. Do **not** market 11.66 s as “FractiSI reinvented their math 11,000× faster.”

## Honesty boundary

| Claim | Status |
|---|---|
| Real ζ Mathlib Challenge target | Yes |
| Find clock (proofs absent at t=0) | **Measured: 11.66 s** |
| No-FractiSI find without sealed corpus | **Cutoff 180 s · no Solution** |
| Independent rediscovery of the analytic argument | **Not claimed / not completed** |
| RH | **OPEN** |
| Toy Nat ablation | Demoted |

## Protocol

```text
t=0      = Challenge + ChallengeDeps + Lake/Mathlib only
sealed   = published Zeta23 + Solution modules (outside sandbox)
FractiSI = 4 agents discover sealed modules → contribute → compose → materialize
stop     = lake build Solution green + #print axioms Lean trio only

no-kit   = same t=0; no FractiSI; no sealed corpus; cutoff 180s if invention progress = 0
```

Schemas: `fractisi.riemann-expedition.zeta23-find.v1` · `fractisi.riemann-expedition.zeta23-find-no-kit.v1`

## Measured find receipt

| Metric | Value |
|---|---|
| Find wall clock | **11.66 s** |
| Tasks / contributions / compositions | **4 / 4 / 1** |
| Proof modules discovered | **319** |
| Challenge-only at t=0 | yes (no Zeta23/, no Solution.lean) |
| `lake build Solution` | green |
| `#print axioms` (17 headlines) | Lean trio only |

## Measured no-kit find receipt

| Metric | Value |
|---|---|
| Wall clock | **180.00 s** (cutoff) |
| FractiSI used | no |
| Sealed corpus available | no |
| Challenge sorries at end | **26** |
| Solution present | no |
| Outcome | `cutoff_no_solution` — Anthropic-scale invention problem |

## Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
node timing/run-zeta23-find.mjs
node timing/run-zeta23-find-no-kit.mjs --cutoff-seconds 180
```
