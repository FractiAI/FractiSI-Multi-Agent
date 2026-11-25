# Can FractiSI Coordinate A Multi-Agent Mathematical Workflow And Produce Lean-Verified Results In Seconds?

**Short answer: Yes as a workflow demonstration.** FractiSI Multi-Agent coordinated four specialized agents to construct and obtain Lean verification of a collection of finite mathematical propositions related to the Riemann hypothesis in approximately **5.3 seconds** (`durationSeconds = 5.326586`), with no `sorry`. This is not a controlled speedup claim versus Anthropic’s ~30-hour Fermat’s Last Theorem Lean formalization. The tasks differ in mathematical scope. The Riemann hypothesis remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Registry ID:** `riemann-fractisi-expedition-2026-11`  
**Operator:** FractiAI Research · FractiSI Multi-Agent  
**Classification:** Application companion · computational expedition · Lean formalization workflow · **not** a proof of RH · **not** a controlled bake-off  
**Date:** 24 November 2026  
**Harness:** `expeditions/riemann-fractisi/` · `tiny.mjs` agents · Lean 4.14 / Lake  
**Ship blog:** `/blog/riemann-fractisi-expedition/`  
**Peers:** Shared-World Collective Intelligence · Tiny Gateway / Rhyming Templates · FractiSI Expedition 002

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Expedition claim | FractiSI can coordinate a multi-agent mathematical workflow and produce machine-verified Lean results in seconds | A proof of the Riemann hypothesis |
| Evidence tier | Timing receipt with ISO start/end + `durationSeconds`; Lean gate with no `sorry`; four named agents on a shared world | CapEx, HBM, or LLM model bake-off; Mathlib-scale FLT formalization |
| Anthropic clocks | Published ~30 h wall clock for FLT Lean formalization used as a **reference scale**, with explicit task mismatch | A claim that Anthropic spent 30 h on RH, or that FractiSI is 20,000× faster on the same theorem |
| Mathematical scope | Finite RH-adjacent proportion-ladder Props, monotonicity, finite Hardy-style witness | Full analytic ζ / published literature proportion theorems in Mathlib |
| Next science | Motivates a same-theorem controlled experiment measuring verified progress per unit time and compute | A finished architecture verdict |

## Abstract

What we have demonstrated is potentially significant, but the distinction is important: FractiSI can coordinate a multi-agent mathematical workflow and produce machine-verified Lean results in seconds, rather than hours.

The deeper significance is not simply that FractiSI is faster. It may be changing how much computational work is necessary to arrive at a verified solution — reduced coordination overhead, less redundant reconstruction, and verification kept inside the loop.

This expedition gave FractiSI an RH-adjacent formalization challenge. Four cooperating agents worked through FractiSI’s shared-world architecture via Tiny Gateway: a lead organized the task, a lemma worker developed supporting results, a referee checked reasoning, and a Lean builder translated results into formal mathematics. Lean accepted the resulting proofs without `sorry`.

The Anthropic ~30-hour FLT formalization clock is an honest reference scale for multi-agent Lean work at published magnitude. FractiSI’s Phase N clock is **5.326586 seconds**. The nominal ratio (~20,300×) is reported for orientation and is **not** a scientifically defensible speed advantage, because the mathematical tasks differ substantially.

## 1. Research question

Can FractiSI coordinate a small multi-agent team to produce Lean-verified mathematical propositions with dramatically less elapsed time than a published multi-agent Lean formalization reference — and what does that demonstrate before a same-theorem controlled comparison exists?

Deeper (hypothesis, not claim): can FractiSI’s shared-world and selective-reconstruction architecture substantially reduce the time and computational resources required for verified mathematical progress?

## 2. What actually happened

### 2.1 Agents

| Role | Job |
|---|---|
| Lead | Organized the mathematical task |
| Lemma worker | Developed supporting mathematical results |
| Referee | Checked the reasoning |
| Lean builder | Translated results into Lean-checkable formal mathematics |

They worked through FractiSI’s shared-world architecture, using Tiny Gateway to coordinate shared information and individual contributions.

### 2.2 Clocks

| | Anthropic reference | FractiSI Phase N |
|---|---|---|
| What was timed | Agents until Lean checks the proof | Agents until Lean checks the proof |
| Wall clock | ~30 hours | **5.326586 seconds** |
| Task | FLT Lean formalization (~1000 agents) | Finite RH-adjacent Props (4 agents) |
| How we know | Fable 5.2 formalization write-up | Timing receipt (`fractisi.riemann-expedition.timing.v1`) |

Nominal wall-clock ratio: 30 hours ÷ 5.326586 seconds ≈ **20,300×**. This is **not** a controlled speedup measurement.

### 2.3 Verification

Lean accepted the resulting proofs without `sorry`. That means this was not simply an AI claiming it had solved something. Lean checked the formal results.

## 3. What FractiSI actually proved

**Proved (Phase N, no `sorry`):**

- Finite proportion-ladder propositions (Levinson / Conrey / Anthropic-2026 millesimal scaffolds as finite Props)
- Monotonicity relationships on that ladder
- A finite Hardy-style witness on a scaffold of zeros

**Not proved:**

- The Riemann hypothesis (`rhClaimStatus` = OPEN)
- Analytic ζ / Mathlib formalization of the published literature proportion theorems

Think of it this way: a mathematical framework was constructed, work was divided among cooperating agents, results were assembled, and the resulting statements passed through an independent verification system. The result was machine-verified. The boundary remains: this did not establish the full analytic results in the published literature.

## 4. Why this could matter beyond a speed comparison

### 4.1 Reduced coordination overhead

Traditional multi-agent systems can spend considerable resources repeatedly exchanging, reconstructing, and reconciling information. FractiSI shares the common world once and distributes individual changes. Agents work from shared context instead of repeatedly rebuilding the entire picture.

### 4.2 Faster convergence

The architecture potentially reduces redundant work required to reach a common result. That is the deeper hypothesis behind FractiSI rhyme: different agents can recognize and reuse underlying patterns of organization rather than independently reconstructing everything.

### 4.3 Verification remains part of the process

The system did not just produce an answer quickly. It produced Lean-accepted results. That distinction matters for mathematics, software engineering, and scientific computing.

## 5. Honest comparison with Anthropic

| Dimension | Anthropic reference | FractiSI |
|---|---|---|
| Task | Fermat’s Last Theorem formalization | Finite RH-adjacent propositions |
| Agent scale | Approximately 1,000 | 4 |
| Wall clock | Approximately 30 hours | 5.3 seconds |
| Verification | Lean | Lean |
| Mathematical scope | Major theorem formalization | Smaller finite propositions |
| RH solved? | No | No |

The comparison establishes an interesting result, but not yet a scientifically defensible 20,000-fold speed advantage. The tasks differ substantially in mathematical difficulty and scope.

Primary sources:

- Anthropic 30 h baseline: https://www.anthropic.com/claude-fable-and-mythos-5-2
- Anthropic Riemann (bound improved; RH not solved): https://www.anthropic.com/research/riemann-zeta

## 6. Core finding

**FractiSI Riemann Expedition — Core Finding**

FractiSI Multi-Agent coordinated four specialized agents to construct and obtain Lean verification of a collection of finite mathematical propositions related to the Riemann hypothesis in approximately 5.3 seconds.

This demonstrates a functioning rapid multi-agent mathematical workflow with machine-verified output.

The result motivates a larger investigation into whether FractiSI’s shared-world and selective-reconstruction architecture can substantially reduce the time and computational resources required for mathematical problem solving.

The more interesting question than whether FractiSI can beat Anthropic’s 30-hour run is:

> Can FractiSI achieve comparable mathematical outcomes with dramatically less coordination, less computation, and less elapsed time?

That is the experiment worth pursuing.

## 7. What to do next

Do not claim a 20,000× speed advantage. Design a controlled experiment that makes that claim testable.

1. **Same mathematical problem.** Give FractiSI and a conventional agent system exactly the same Lean theorem, assumptions, libraries, and starting conditions.
2. **Measure actual work.** Record elapsed time, token consumption, agent count, tool calls, repeated work, and verification attempts.
3. **Increase difficulty.** Progressively increase theorem complexity until one system reaches a limit the other has not reached.

The most important measurement is not just seconds. It is:

> How much verified mathematical progress can each architecture produce per unit of time and computational resources?

## 8. Assessment

This is an encouraging first demonstration of something potentially larger than a faster proof-writing workflow: evidence that FractiSI can coordinate a small mathematical team, produce useful formal results, and get them verified in seconds.

The next experiment should establish whether that advantage survives when both systems face exactly the same mathematical challenge. That is where a serious case can begin that FractiSI represents a different computational architecture, not merely a faster way of running agents.

## Paths

- Expedition kit: `expeditions/riemann-fractisi/`
- Results report: `expeditions/riemann-fractisi/riemann-fractisi-results-report.md`
- Phase N receipt: `expeditions/riemann-fractisi/lean/receipts/riemann-fractisi-expedition-phaseN-2026-11-24T23-31-57-372Z.json`
- Blog: `/blog/riemann-fractisi-expedition/`
