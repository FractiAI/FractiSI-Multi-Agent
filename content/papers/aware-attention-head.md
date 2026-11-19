# The Aware Attention Head Expedition — Which Mechanisms Does a Persistent Orchestrating Head Actually Need?

**Document ID:** `WP-AWARE-ATTENTION-HEAD-SPIRIT-OCTAVES-EGS-2026-11-20`  
**Registry ID:** `synthobs-aware-attention-head-expedition-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion · computational mechanism test · **not** Infinite Octaves ENGINE_SHELF  
**Date:** 20 November 2026  
**Harness:** `research/synthobs-aware-attention-head-expedition/`  
**Peers:** FractiSI Expedition 002 (shared world) · Attention, Awareness, Downstream Activation · Wiring Wet Lab  

## Honesty boundary

| Tier | What this paper is | What it is not |
|---|---|---|
| Mechanism test | A scripted simulation that asks which components of an orchestrating head are necessary for four task families, under stated loss assumptions | A measurement of real LLM agents, humans, or organizations |
| Framing | “Aware attention head” names a design: persistent mission, evidence-checked attention, on-demand specialist shells, selective hand-off | A claim about spirit, consciousness, or religious doctrine |
| Pin status | ENGINE_SHELF pin is **deferred** even though all mechanism gates pass | A statement that the architecture is proven in production |

Two results are built into the simulator by design and are reported as such: the head’s accuracy on the attention-trap family, and the size of its advantage on the persistence and transfer families, both follow from the assumptions in Section 4. What the experiment can tell us is *which components matter* and *how large the baseline loss must be before the head pays off*. It cannot tell us whether real agents behave this way.

## Abstract

Multi-agent systems usually decide by majority or by weighted vote. Two failure modes recur: a confident majority drowns out a small group that holds the correct, independently corroborated answer, and long tasks that cross several contexts lose track of their own mission or of facts established earlier. We test a design that addresses both: an **aware attention head** that persists across contexts, checks signals for independent corroboration instead of counting them, builds a specialist shell when a capability gap appears, and reconstructs only what a later context needs.

We compare three architectures on 200 randomized trials in each of four task families: **A**, flat agents with a plurality vote; **B**, a shared world with a confidence-weighted vote; and **C**, the head. Overall success is 63.1% for A, 68.4% for B, and 94.8% for C at essentially equal compute. Ablating any single mechanism removes between 9.5 and 58.0 points from C. A decoy test shows that a head which simply trusts the minority fails every decoy, while the evidence-checked head does not. A sensitivity control shows the persistence and transfer advantages disappear when baseline loss falls to 2% per hand-off, matching the head’s own loss rate. The mechanisms are therefore necessary under the stated assumptions, and the assumptions are the thing to test next in live agents.

## 1. Question

Which components of an orchestrating head are necessary for a multi-agent system to (a) follow a corroborated minority over an uncorroborated majority, (b) build missing capability on demand, (c) keep a mission intact across context switches, and (d) carry a fact across contexts without losing it?

## 2. Background

FractiSI Expedition 002 showed that a shared world with selective reconstruction can outperform flat agents on relationship discovery. That result leaves a design question open: does the shared world need an orchestrator that decides where attention goes, and if so, which of its functions do the work? The Attention, Awareness, Downstream Activation paper argued that what a system attends to determines what activates downstream. This expedition turns that argument into four falsifiable tests with named ablations.

The word “octave” is used in the Infinite Octaves sense of a nested context scale. A shell is a specialist context created for a bounded purpose and retired when the purpose ends. The head is the persistent layer that survives shell creation and retirement.

## 3. Hypotheses

1. **H1 (attention).** Checking signals for independent corroboration beats counting or weighting them when a corroborated minority opposes an uncorroborated majority, and does not lose to weighting when the minority is a decoy.
2. **H2 (construction).** Creating a specialist shell on demand beats guessing when the required capability is absent and budget allows.
3. **H3 (persistence).** A persistent mission record lowers drift across context switches.
4. **H4 (transfer).** Selective reconstruction into the next context loses fewer facts than hand-off without it.
5. **Falsifier.** If removing a mechanism costs less than five points in its own family, or if the advantage survives a baseline loss rate equal to the head’s, the mechanism is not what produced the gain.

## 4. Method

### 4.1 Architectures

| Arch | Description |
|---|---|
| A | Independent agents; plurality vote; ties broken at random |
| B | Shared world; every signal is read; confidence-weighted vote |
| C | A plus B plus a head: evidence-checked attention, persistent mission, shell creation and retirement, selective cross-context reconstruction |

B is deliberately strong. It reads every signal and weights by confidence, so it is not a straw baseline for the attention family.

### 4.2 Task families (200 randomized trials each)

- **Attention trap.** Three to seven majority agents at confidence 0.30–0.60 oppose one or two specialists at 0.55–0.90. In 35% of trials the minority is a **decoy**: the specialists are confident but uncorroborated, and the majority is correct. Otherwise the specialists’ answer is independently corroborated and correct.
- **Self-construction.** The task needs a simulation capability. In 30% of trials an agent already has it. Otherwise the head must spend four compute units (three to create the shell, one to use it) from a budget of two to eight. A shell answers correctly with probability 0.88.
- **Identity persistence.** Three to five context switches. Each switch can corrupt the mission with a per-switch drift probability. A mission that drifts forces a guess.
- **Octave transfer.** Two to four hand-offs of a single fact between contexts. Each hand-off can lose the fact.

### 4.3 Stated assumptions

| Parameter | A | B | C |
|---|---|---|---|
| Mission drift per switch | 0.15 | 0.15 | 0.02 |
| Fact loss per hand-off | 0.30 | 0.10 | 0.03 |

These are assumptions, not measurements. They are the quantities a live-agent replication should estimate.

### 4.4 Controls and gates

- **Ablations.** Each mechanism is switched off alone in its own family.
- **Naive-redirect control.** The head follows any minority without checking corroboration.
- **Sensitivity sweep.** Baseline drift and loss are swept from 0.02 to 0.15 for A and B while C is held fixed.
- **Gates.** G1: C beats B overall by at least ten points. G2: C is no worse than B on decoys, and the naive head is worse than C. G3: every ablation costs at least five points. G4: at baseline loss 0.02 the C−B gap on persistence and transfer is three points or less. G5: C’s mean compute is within three times B’s.

## 5. Results

### 5.1 Headline

| Family | A flat | B shared world | C aware head | C−B (95% CI) |
|---|---|---|---|---|
| Attention trap | 39.5% | 42.0% | 100.0% | +58.0 [51.5, 65.0] |
| Self-construction | 68.0% | 68.0% | 86.5% | +18.5 [12.0, 25.0] |
| Identity persistence | 77.0% | 77.0% | 96.5% | +19.5 [14.0, 25.0] |
| Octave transfer | 68.0% | 86.5% | 96.0% | +9.5 [5.5, 14.0] |
| **Overall** | **63.1%** | **68.4%** | **94.8%** | |

Mean compute per trial is 4.00 for A, 5.00 for B, and 4.95 for C.

### 5.2 Attention: the decoy test matters more than the headline

On genuine-minority trials (121 of 200), A is correct 0% of the time and B 5.8%, because a majority of low-confidence agents outweighs one or two confident specialists. C is correct 100% of the time. That 100% is a consequence of the simulator: corroboration is a flag set when the minority is genuine, so a head that checks the flag cannot be wrong. It should be read as “the mechanism works when a reliable corroboration signal exists,” not as a performance estimate.

The decoy trials (79 of 200) are the meaningful control. A is right on all of them, B on 97.5%, C on 100%. The naive-redirect head, which trusts any minority, is right on **0%** of decoys and 100% of genuine minorities. Its overall score is 60.5%. Following the minority is not the mechanism. Checking the minority is.

### 5.3 Ablations

| Mechanism removed | Family | Success | Drop vs full C |
|---|---|---|---|
| Evidence check | Attention trap | 60.5% | −39.5 |
| Meta-attention | Attention trap | 42.0% | −58.0 |
| Shell creation | Self-construction | 68.0% | −18.5 |
| Persistent identity | Identity persistence | 77.0% | −19.5 |
| Cross-octave transfer | Octave transfer | 86.5% | −9.5 |

Every ablation returns C to the B or A level in its family, which is what a necessity claim predicts.

### 5.4 Sensitivity: where the advantage comes from

| Baseline loss rate | Persistence gap (C−B) | Transfer gap (C−B) |
|---|---|---|
| 0.02 | 0.0 | −0.5 |
| 0.05 | +6.0 | +2.5 |
| 0.10 | +14.0 | +9.5 |
| 0.15 | +19.5 | +13.5 |

When baseline loss equals the head’s own 0.02, the advantage is gone. The persistence and transfer gains are therefore a function of how much baselines lose, not an intrinsic property of having a head. The prediction for a live replication is concrete: the head helps in proportion to measured per-hand-off loss in the baseline system.

### 5.5 Gates

All five gates pass. The mechanism verdict is **verified under stated assumptions**.

## 6. Interpretation

Three conclusions follow, in decreasing order of confidence.

1. **Counting is the wrong operation for minority evidence.** Weighted voting reads every signal and still loses, because weight is not corroboration. This holds in the simulator for any task where corroboration is observable and weight is not a proxy for it.
2. **Persistence and transfer are loss-rate arguments.** A head earns its place when contexts are lossy, and not otherwise. The sensitivity sweep gives the break-even.
3. **Shell creation is a budget decision.** It only helps when the shell can be funded. In trials with budgets below four units the head guesses like the baselines.

## 7. Limitations

- Agents are scripted. Real agents have correlated errors, partial corroboration, and loss that is not independent across hand-offs.
- The corroboration signal is a perfect oracle in the simulator. Real corroboration is noisy and can be gamed.
- Loss rates for A, B, and C are chosen, not measured.
- The “spirit-like persistence” framing is only a name for mission continuity across contexts. Nothing here probes it beyond that definition.
- The naive-redirect control tests one failure mode. Other failure modes, such as a head that corroborates too eagerly, are not tested.

## 8. Reproducibility

```bash
npm run research:synthobs-aware-attention-head-expedition
npx vitest run tests/research/aware-attention-head-expedition.test.mjs
```

Seed `20261120`, 200 trials per family, 2,000 bootstrap resamples. Output: `research/synthobs-aware-attention-head-expedition/data/empirical_report.json`.

## 9. ENGINE_SHELF decision

The brief for this expedition was to pin only if the results verified. The mechanism gates pass. The pin is nevertheless **deferred**, because the two largest effects are consequences of assumptions that have not been measured on live agents. A pin would present a simulator result as architectural evidence. The pin criteria are: a live-agent replication in which baseline loss and corroboration reliability are measured, and a result that survives the sensitivity break-even.

## 10. Next experiments

1. Replace scripted agents with live LLM agents on the attention-trap family. Measure corroboration reliability and decoy rate instead of assuming them.
2. Estimate per-hand-off mission drift and fact loss in two baseline systems and compare with the break-even table.
3. Add a noisy corroboration signal and a head that over-trusts it. Report the cost.
4. Test a shell budget policy that learns when to create versus guess.

## 11. References

1. FractiSI Expedition 002, *Beyond Memory Savings* (this repository, `docs/SYNTHOBS_FRACTISI_EXPEDITION_002_BEYOND_MEMORY_EGS_2026-11.md`).
2. *Attention, Awareness, Downstream Activation* (`docs/SYNTHOBS_ATTENTION_AWARENESS_DOWNSTREAM_ACTIVATION_EGS_2026-10.md`).
3. *The Wiring Wet Lab* (`docs/SYNTHOBS_WIRING_DISCOVERIES_RHYMING_WORLD_MODEL_EGS_2026-11.md`).
4. Suite README: `research/synthobs-aware-attention-head-expedition/README.md`.

## Fair Exchange

Fair Exchange clause in effect.

→ ∞^∞
