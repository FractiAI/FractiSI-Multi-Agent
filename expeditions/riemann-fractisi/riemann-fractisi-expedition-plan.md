# FractiSI · Riemann Hypothesis Expedition Plan

**Document:** Executable plan + initial artifacts  
**Product:** FractiSI Multi-Agent · Tiny Footprint (Tiny Gateway™)  
**Store paths:** this file · `docs/riemann-lean/` · `docs/riemann-fractisi-results-report-outline.md`  
**Kit SoT:** [FractiAI/FractiSI-Multi-Agent](https://github.com/FractiAI/FractiSI-Multi-Agent)  
**Status:** Matched ablation executed (`run-ablation.mjs`); RH remains OPEN; 30h speed lead withdrawn  
**Date:** 2026-11-24 (ablation 2026-11-25)

---

## 1. Goal

Run a **falsifiable, formalizable, minutes-scale** multi-agent formal-math expedition that:

1. Uses FractiSI **shared-world coordination** (register world once · per-agent deltas · selective reconstruct · composition/referee).
2. Targets a **Riemann-adjacent** Lean formalization ladder — **not** a claim that RH is solved.
3. Emits a **wall-clock receipt** comparable in *methodology* to Anthropic’s long multi-agent formal-math runs (~30 h FLT formalization baseline).

**Success is coordination + formalization throughput under honesty rails**, not CapEx/HBM/LLM bake-off wins.

---

## 2. Honesty boundary (non-negotiable)

| Claims / does | Does **not** claim |
|---|---|
| Timed FractiSI-coordinated Lean work on a staged RH-*adjacent* ladder | That the Riemann hypothesis is proved |
| Wall-clock minutes-scale Phase-0 (scaffold build + harness) and Phase-N agent pushes | Like-for-like model bake-off vs Claude Fable / Opus |
| Methodology comparison vs Anthropic’s published multi-agent formalization pattern | CapEx, HBM, DRAM, or $/token superiority |
| Receipt JSON with ISO start/end + seconds | That Phase-0 Nat models = Mathlib `ζ` analysis |
| Explicit citation of Anthropic primary URLs | That secondary “RH solved” headlines redefine this expedition’s target |

**RH status in this expedition:** **OPEN.**  
Machine-readable: `docs/riemann-lean/RiemannExpedition/Honesty.lean`.

---

## 3. Anthropic baseline characterization (public sources)

### 3.1 Riemann-related (primary)

**Source:** [Claude has improved on a longstanding lower bound…](https://www.anthropic.com/research/riemann-zeta) · Anthropic · **2026-08-10**

| Fact | Value |
|---|---|
| RH solved? | **No.** Post states Claude “didn’t succeed” at RH; techniques “not expected” to prove RH |
| What improved | Lower bound on fraction of zeta zeros on the critical line: **41.6% → 67.2%** |
| Method sketch | Claude Code · ~**60** subagents · ~**1.5 days** · ~**31M** output tokens · ~2400 shell commands · numerical checks · mutual refereeing · arXiv duplicate search · Lean formalization of *that* result (`comparator`) |
| Human role | Encouragement prompts; Anthropic mathematicians validated; external experts examined |

This is the **mathematical adjacency** for our Lean target (proportion ladder), not the 30 h clock baseline.

### 3.2 ~30 hour multi-agent formal-math baseline (primary)

**Sources:**

- [Introducing Claude Fable 5.2 and Claude Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2) · **2026-11-09** — “~1,000 Fable 5.2 agents fully formalized [FLT] in just **30 hours**”
- [Formalizing Fermat’s Last Theorem](https://www.anthropic.com/research/formalizing-fermats-last-theorem) · **2026-09-04** — first complete Lean FLT formalization (~**11 days**, Prove2Me DAG, dozens of agents)
- Public code (earlier formalization): [anthropics/fermats-last-theorem](https://github.com/anthropics/fermats-last-theorem)

| Fact | Value |
|---|---|
| Theorem | Fermat’s Last Theorem (**known** theorem; formalization, not a new proof of an open problem) |
| Wall clock | ~**28.7–30 h** for the Fable 5.2 reproduction run (Anthropic) |
| Agents | ~**1 lead + ~999 helpers** |
| Starting kit (as Anthropic amended) | 60 statements · one-sentence classical sketch · definitions · **47** proved lemmas · lead/helper roles |
| Infra pattern | Per-agent VM · Lean/Mathlib · Git branch · shared DB · time reminders · one recorded restart |

**This expedition’s ~30 h comparison baseline** = that **FLT multi-agent Lean formalization methodology / wall-clock**, transferred to a **smaller, RH-adjacent** ladder. It is **not** a claim that Anthropic spent 30 h on RH, and **not** a claim RH fell.

### 3.3 Secondary headlines (blocker note)

Some November 2026 secondary articles discuss further RH / Lean claims involving Anthropic-affiliated mathematicians. **This plan does not treat RH as solved.** If a coordinator later wants to cite those pieces, attach primary Lean artifacts + independent certification URLs in the results report; until then, **primary Anthropic Riemann post (RH open; bound improved)** + **FLT 30 h formalization** are the grounding pair.

---

## 4. Chosen Lean formal target

**Name:** `CriticalLineProportionFormalization`  
**Path:** `docs/riemann-lean/`

### 4.1 What we formalize

A **staged theorem ladder** of classical / reported **critical-line proportion** milestones, as Nat millesimals + abstract critical-line predicates:

| Milestone | Millesimal | Role |
|---|---:|---|
| Levinson-era ~⅓ | 333 | Ladder step (known literature scale) |
| Conrey-era ~41.6% | 416 | Anthropic “prior” constant |
| Anthropic 2026 report 67.2% | 672 | Adjacency target (statement slot in Phase N) |
| Full RH | 1000 | Explicit upper sentinel — **not proved** |

Phase 0 proves **ordering / sample arithmetic** and a toy critical-line model (`RealPart` Nat pairs).  
Phase N replaces `True` slots with real analytic statements (ideally Mathlib-backed) and removes placeholders.

### 4.2 What “passes formal proof” means

1. `lake build` succeeds on the pinned toolchain (`leanprover/lean4:v4.14.0`).
2. Claimed phase modules contain **no** `sorry`.
3. `#print axioms` / kernel check on claimed theorems uses only Lean’s standard axioms (when Mathlib enters later: same rule as Anthropic FLT write-ups).
4. **RH is not among the proved theorems.** `Honesty.rhClaimStatus` stays `OPEN`.
5. Timing harness receipt records `leanGate.ok: true` for that phase.

Phase 0 already meets (1)(2)(4) for the scaffold lemmas.

---

## 5. FractiSI multi-agent architecture for this run

Mirror Expedition 002 / platform layers with **named surfaces** (not hero “Layer A–F” marketing voice):

| Surface | Role in expedition |
|---|---|
| **Tiny Footprint** | One shared world: theorem DAG, lemma statements, paper notes, Lean file ownership map |
| **Coordination** | Agent registration, ownership of lemma IDs, interference detection on same declaration |
| **Shared state** | Task board: `open / proving / refereeing / merged` |
| **Composition** | Integrate proved lemmas; reject conflicting edits; rollback bad merges |
| **Git awareness** | Per-agent branches or scoped paths under `RiemannExpedition/` |
| **Deploy** | Optional: publish receipt + report only on approval (not auto) |

### 5.1 Shared world contents (register once)

- Lean project root + `lakefile` / toolchain  
- Theorem DAG (Phase0 closed · PhaseN slots)  
- Citation pack (Anthropic URLs, honesty strings)  
- Receipt schema id `fractisi.riemann-expedition.timing.v1`

### 5.2 Per-agent deltas

Each agent keeps deltas only for:

- assigned lemma file patches  
- local `lake build` logs  
- referee notes  

Selective reconstruct pulls: lemma statement + dependencies + last green receipt — not full chat reprints.

### 5.3 Agent roster (minutes-scale default)

| Agent ID | Role | Duty |
|---|---|---|
| `lead` | Orchestrator | Prioritize DAG; reassign; call time; refuse RH-solved claims |
| `lemma-worker` × N (default 3) | Prover | Own 1–k Phase-N slots or Phase-0 extensions |
| `referee` | Checker | Independent re-prove / `lake build` / axiom skim |
| `lean-builder` | CI | Continuous `lake build`; write harness steps |
| `scribe` (optional) | Reporter | Fill results outline from receipt |

**Default N for a minutes run:** 4–8 coordinated agents (not 1000). Scaling up is a later protocol knob; do not pretend 8 agents = 1000-agent FLT.

Kit hooks (when kit present):

```bash
node scripts/tiny.mjs init
node scripts/tiny.mjs agents register lead expedition
node scripts/tiny.mjs agents register lemma-worker expedition
node scripts/tiny.mjs agents register referee expedition
node scripts/tiny.mjs agents register lean-builder expedition
node scripts/tiny.mjs status
```

Harness: `docs/riemann-lean/timing/run-expedition.mjs --tiny <path-to-tiny.mjs>`.

---

## 6. Phased execution (minutes-scale target)

Wall-clock aims are **lab targets**, not SLAs.

| Phase | Target clock | Work | Exit criteria |
|---|---|---|---|
| **P0 · Scaffold** | ≤ 5 min | `lake build` + `riemann-check` + harness receipt | Receipt with `leanGate.ok`; RH OPEN |
| **P1 · World up** | ≤ 3 min | `tiny init` + register roster + DAG freeze | `.fractisi` / status OK (if kit); agents listed |
| **P2 · Parallel lemmas** | 5–15 min | Workers extend Phase0 or fill one PhaseN slot with a *real* elementary lemma | ≥1 new sorry-free theorem merged; referee ACK |
| **P3 · Referee + compose** | 2–5 min | Independent rebuild; composition integrate | Green build; no honesty regression |
| **P4 · Receipt + outline** | ≤ 2 min | Final harness run; draft results sections | JSON receipt path + outline stubs filled |

**Stretch (hours, not this plan’s default):** Mathlib import · formalize a published proportion lemma for real · comparator-style statement check. Still **not** RH.

---

## 7. Success criteria

### Must

- [ ] Honesty block unchanged (RH OPEN; Anthropic URLs cited)  
- [ ] Phase claimed by the run is sorry-free and `lake build` green  
- [ ] Timing receipt written with ISO start/end + `durationSeconds`  
- [ ] Comparison section filled vs ~30 h FLT baseline **with caveat** (different theorem / scale)  
- [ ] No CapEx/HBM/LLM-win language in report  

### Nice

- [ ] Kit `--tiny` hook exercised (`tiny init` / `agents register`)  
- [ ] ≥1 Phase-N slot upgraded from `True` to a real statement + proof  
- [ ] Referee agent log attached to receipt `steps`

### Fail (auto)

- Any public claim “RH proved by this expedition”  
- Hand-edited “results” without receipt  
- Silent Mathlib pin change without rebuild receipt  

---

## 8. Comparison protocol vs ~30 h Anthropic baseline

Record in the results report (and receipt `comparison` object):

| Field | Source |
|---|---|
| `baselineName` | Anthropic Fable 5.2 FLT Lean formalization (~30 h) |
| `baselineHours` | 30 (or 28.7 if citing the technical write-up figure) |
| `baselineURL` | https://www.anthropic.com/claude-fable-and-mythos-5-2 |
| `wallClockSeconds` | Harness `durationSeconds` |
| `naiveSpeedupFactor` | **Withdrawn** from science receipts — use `run-ablation.mjs` delta instead |
| `caveat` | Different theorem (FLT formalization vs RH-adjacent ladder); different agent count; different model stack; Phase-0 is scaffold arithmetic — **methodology / process comparison only** |

Optional second row: Anthropic Riemann **~1.5 day / ~60 subagents** bound-improvement run as *adjacency* baseline (not the 30 h number).

**Do not** present naive speedup as a product benchmark win.

---

## 9. Risks / non-claims

| Risk | Mitigation |
|---|---|
| Headline confusion (RH “solved” elsewhere) | Primary Anthropic Riemann URL + Honesty.lean; results report “Honesty” section first |
| Scope creep into full analytic formalization | Phase caps; Mathlib = stretch only |
| Kit absent in environment | Harness works without `--tiny`; document hook for later |
| Fake equivalence of 5 min scaffold vs 30 h FLT | Mandatory caveat string in receipt schema |
| `sorry` leakage | Phase0 CI gate; PhaseN placeholders are `True`, not `sorry` |
| Overclaim coordination quality | Cite Expedition 002 honesty: architectural labs ≠ LLM superiority |

---

## 10. Artifact index

| Artifact | Absolute path |
|---|---|
| This plan | `/cursor/stores/self/docs/riemann-fractisi-expedition-plan.md` |
| Results outline | `/cursor/stores/self/docs/riemann-fractisi-results-report-outline.md` |
| Lean root | `/cursor/stores/self/docs/riemann-lean/` |
| Lean README | `/cursor/stores/self/docs/riemann-lean/README.md` |
| Timing harness | `/cursor/stores/self/docs/riemann-lean/timing/run-expedition.mjs` |
| Shell wrapper | `/cursor/stores/self/docs/riemann-lean/timing/run-expedition.sh` |
| Receipts dir | `/cursor/stores/self/docs/riemann-lean/receipts/` |
| Orientation briefing | `/cursor/stores/self/docs/fractisi-repo-orientation.md` |

---

## 11. Immediate next actions (executable)

```bash
export PATH="$HOME/.elan/bin:$PATH"   # if needed
cd /cursor/stores/self/docs/riemann-lean
lake build
node timing/run-expedition.mjs --phase 0
# optional kit:
# node timing/run-expedition.mjs --phase 0 --tiny /workspace/scripts/tiny.mjs
```

Then assign agents to P1–P4, fill `/cursor/stores/self/docs/riemann-fractisi-results-report-outline.md`, and attach the receipt JSON path.

---

*End of plan. FractiSI Multi-Agent · Riemann-adjacent formalization expedition.*
