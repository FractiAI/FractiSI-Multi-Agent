# A Matched FractiSI Vs No-Kit Lean Ablation

**Short answer: This expedition now reports a real matched trial.** Four agents claim tasks, submit Lean payloads, compose, and git-integrate inside the clock; a no-kit arm writes the same frozen bytes sequentially. Both arms pass a hard Lean gate. FractiSI records **tasks 4, contributions 4, compositions 1** every run; no-kit records **0 / 0 / 0**. Mean wall clock over five runs: no-kit **~1.29 s**, FractiSI **~10.8 s** — kit coordination overhead on this frozen-payload workload, not an LLM proof-search win. RH remains **OPEN**. The old 30 h vs 5.3 s lead stays withdrawn.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · **matched ablation trial** · **not** RH · **not** an LLM bake-off  
**Date:** 24 November 2026 (ablation shipped 25 November 2026)  
**Harness:** `expeditions/riemann-fractisi/lean/timing/run-ablation.mjs` · Lean 4.14 / Lake  
**Ship blog:** `/blog/riemann-fractisi-expedition/`

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Expedition claim | Same frozen Lean payload bytes, two arms, work inside the clock, hard gate, ≥5-run summary | Evidence that FractiSI invents proofs or beats Anthropic’s FLT search |
| FractiSI arm | Register agents → claim tasks → submit contributions → compose → git integrate → `lake build` + forbidden-token scan | Model reasoning / token burn |
| No-kit arm | Sequential `writeFile` of the same four modules → same hard gate | A crippled Lean build |
| Mathematical content | Finite-sample `Nat` millesimal inequalities + nonempty critical-line scaffold (`total > 0`) | Formalization of ζ, Levinson/Conrey/Hardy analytic theorems, or RH |
| Verification gate | `lake build` green **and** code scan rejects `sorry`, user `axiom`, `native_decide` | Mathlib-scale analytic formalization |
| Anthropic figures | Context only (zeta-bound post RH open; FLT ~30 h) | A controlled speedup claim |

## Abstract

The first public version of this expedition timed registry labels plus a rebuild of pre-written files and led with an unlike-activity speed ratio. An audit rejected that framing. This revision runs the comparison the audit asked for, within the scope this kit can honestly measure today:

1. **Frozen payloads** — SHA-256 of `AgentCritical`, `AgentProportion`, `Phase0`, and `PhaseN` fixed before either arm starts.
2. **Work inside the clock** — those four modules are absent from the sandbox until the arm writes them.
3. **Matched ablation** — no-kit sequential write vs FractiSI task/claim/contribute/compose/git-integrate.
4. **Hard gate** — `lake build` plus forbidden-token scan; comments/strings stripped; worktrees skipped.
5. **Coordination evidence** — FractiSI receipts show tasks, contributions, and compositions; no-kit shows none.

Payload bytes are pre-authored. This trial measures **coordination + integration under a Lean gate**, not LLM lemma search. That limit is stated, not hidden.

## 1. Research question

For the same frozen Lean modules, what does FractiSI coordination change relative to a sequential no-kit write, under a hard build gate?

## 2. Protocol

```text
prepare sandbox  = Honesty + CriticalLine + ProportionLadder + lakefile
                   (agent modules deleted)
arm no-kit       = write 4 modules → hard gate
arm fractisi     = 4 agents × (claim → contribute → worktree apply → commit)
                   → compose → validate → git integrate → hard gate
compare          = wall clock, gate ok, tasks/contributions/compositions
```

Harness: `node timing/run-ablation.mjs`  
Summary (5 runs): `lean/receipts/riemann-fractisi-ablation-summary-5runs.json`  
Schema: `fractisi.riemann-expedition.ablation.v1`

### Roles (path-disjoint)

| Agent | Path |
|---|---|
| `lemma-critical` | `RiemannExpedition/AgentCritical.lean` |
| `lemma-proportion` | `RiemannExpedition/AgentProportion.lean` |
| `phase0-composer` | `RiemannExpedition/Phase0.lean` |
| `phasen-composer` | `RiemannExpedition/PhaseN.lean` |

## 3. Measured results (5 runs)

| Arm | Mean wall clock | Stdev | Hard gate | Tasks | Contributions | Compositions |
|---|---|---|---|---|---|---|
| no-kit | **1.294 s** | 0.066 s | pass ×5 | 0 | 0 | 0 |
| FractiSI | **10.844 s** | 4.664 s | pass ×5 | 4 | 4 | 1 |

Mean delta (FractiSI − no-kit): **+9.55 s**. On this frozen-payload rebuild, FractiSI’s worktree/claim/compose/git path is slower than a sequential write. That is the measured comparison — kit overhead and coordination evidence, not a proof-search speedup.

Lean content stays finite-sample arithmetic: millesimals 333 / 416 / 672 / 1000 with `MeetsLowerBound` requiring `total > 0`; identifier `FiniteSampleOnCriticalLine` is not RH; 416 tracks five-twelfths (Pratt–Robles–Zaharescu–Zeindler), not Conrey’s “more than 2/5” analytic theorem.

## 4. What we withdraw

We still **withdraw** leading with 30 hours vs 5.3 seconds or ~20,000×. Those compared unlike activities. Anthropic citations remain context.

## 5. Limits (still honest)

- Payload *bytes* are pre-authored; agents do not invent lemmas.
- No Mathlib ζ analysis.
- `#print axioms` is attempted and recorded when it succeeds; the hard gate’s pass condition is build + forbidden-token scan.
- Receipts bind payload SHA-256 and git commit when available.

## 6. Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
lake build
node timing/run-ablation.mjs
```

## Paths

- Ablation harness: `expeditions/riemann-fractisi/lean/timing/run-ablation.mjs`
- Hard gate: `expeditions/riemann-fractisi/lean/timing/hard-gate.mjs`
- Summary receipt: `expeditions/riemann-fractisi/lean/receipts/riemann-fractisi-ablation-summary-5runs.json`
- Blog: `/blog/riemann-fractisi-expedition/`
