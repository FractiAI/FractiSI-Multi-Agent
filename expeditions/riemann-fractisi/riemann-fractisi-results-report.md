# Riemann FractiSI Expedition · Results Report

**Product:** FractiSI Multi-Agent · Tiny Footprint (Tiny Gateway™)  
**Plan:** `/cursor/stores/self/docs/riemann-fractisi-expedition-plan.md`  
**Lean:** `/cursor/stores/self/docs/riemann-lean/` · kit mirror `expeditions/riemann-fractisi/lean/`  
**Harness:** `/cursor/stores/self/docs/riemann-lean/timing/run-expedition.mjs`  
**Run date:** 2026-11-24 (America/Los_Angeles)

---

## Front matter

| Field | Value |
|---|---|
| Run id | `riemann-fractisi-expedition-2026-11-24` |
| Latest receipt (Phase N) | `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phaseN-2026-11-24T23-31-57-372Z.json` |
| Paired Phase 0 receipt | `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phase0-2026-11-24T23-31-51-912Z.json` |
| Phase claimed | **N** (proportion ladder closed in finite model; analytic ζ deferred) + paired **0** |
| Agents registered | `lead`, `lemma-worker`, `referee`, `lean-builder` via `tiny.mjs` |
| Operator / Project | FractiSI · FRA-2 |
| Kit path | `/workspace` · branch `cursor/riemann-fractisi-expedition-cbaa` |

---

## 1. Honesty (do not soften)

- Riemann hypothesis status: **OPEN** (not proved by this expedition).
- Anthropic Riemann primary: https://www.anthropic.com/research/riemann-zeta — improved critical-line zero **lower bound** 41.6% → 67.2%; **did not** prove RH.
- ~30 h baseline primary: https://www.anthropic.com/claude-fable-and-mythos-5-2 — Fable 5.2 ~1000-agent **FLT Lean formalization** (~28.7–30 h). Methodology comparison only.
- Non-claims: no CapEx / HBM / LLM bake-off wins; finite Nat model ≠ Mathlib ζ analysis; Phase-N closes **finite-sample** proportion Props, not the analytic literature proofs.

Machine-readable: `RiemannExpedition.Honesty.rhClaimStatus` =
`OPEN — Riemann hypothesis is not proved in this repository`

---

## 2. Goal restated

Minutes-scale FractiSI-coordinated formalization of the RH-*adjacent* proportion ladder (`CriticalLineProportionFormalization`): Levinson / Conrey / Anthropic-2026 millesimals as Lean Props with proofs, plus a finite Hardy-style witness. **Not** a proof of RH. Wall-clock compared methodologically to Anthropic’s ~30 h FLT Lean formalization baseline.

---

## 3. Methods

### 3.1 FractiSI coordination

- Shared world: Lean project + theorem DAG + honesty strings + receipt schema `fractisi.riemann-expedition.timing.v1`
- Deltas: Phase-N module ownership (`PhaseN.lean`); harness steps for kit init/register/build
- Kit commands: `node scripts/tiny.mjs init` · `status` · `agents register` for four roles · then `lake build` + staged `riemann-check`

### 3.2 Agent roster (harness-registered)

| Agent | Role | Outcome |
|---|---|---|
| lead | Orchestrator | Registered; Phase-N target selected |
| lemma-worker | Prover | Proportion-ladder Props + monotonicity proofs landed |
| referee | Checker | `lake build` + `riemann-check` green in receipt |
| lean-builder | CI | Harness lean gate `ok: true` |

### 3.3 Lean target — completed vs deferred

**Completed (Phase N, no Mathlib, no `sorry`):**

- `LevinsonPositiveProportion` — ∃ finite sample meeting millesimal 333
- `ConreyImprovedProportion` — ∃ finite sample meeting millesimal 416
- `Anthropic2026ProportionFormalization` — toy 672/1000 meets 672, misses full RH, improvement = 256
- Finite Hardy-style: nonempty scaffold zeros all on critical line (**not** Hardy infinitude)
- Ladder monotonicity: `meets_of_le_bound`; Anthropic sample also meets Conrey/Levinson
- `proportion_ladder_bundle` closes the Phase-N claim set
- Marker: `PhaseN-proportion-ladder-closed-analytic-deferred`

**Deferred (analytic / Mathlib stretch):**

- Hardy 1914 infinitude for true `ζ`
- Analytic proofs of Levinson / Conrey / Anthropic proportion theorems for the Riemann zeta function

Toolchain: `leanprover/lean4:v4.14.0`

---

## 4. Timing table

Times below are **UTC** from receipts; Pacific (America/Los_Angeles) = UTC−8.

| Metric | Phase 0 | Phase N |
|---|---|---|
| `startedAt` (UTC) | 2026-11-24T23:31:51.912Z | 2026-11-24T23:31:57.372Z |
| `startedAt` (PT) | 2026-11-24 3:31:51 PM PT | 2026-11-24 3:31:57 PM PT |
| `endedAt` (UTC) | 2026-11-24T23:31:56.904Z | 2026-11-24T23:32:02.699Z |
| `durationSeconds` | **4.992013** | **5.326586** |
| `leanGate.ok` | true | true |
| Kit hook ok | true | true |
| Anthropic baseline hours | 30 (FLT formalization) | 30 |
| `naiveSpeedupFactor` | ~21635× | ~20276× |
| Caveat acknowledged | yes | yes |

**Headline wall-clock (Phase N):** **5.326586 seconds**

Caveat (mandatory): naive speedup compares this harness/phase wall-clock to Anthropic’s published ~30 h **FLT** formalization. Different theorem, agent count, and model stack — **methodology / process comparison only**, not a like-for-like bake-off or product win.

Optional adjacency row: Anthropic Riemann bound-improvement run (~1.5 day / ~60 subagents) is mathematical adjacency, not the 30 h number.

---

## 5. Lean status

| Gate | Result |
|---|---|
| `lake build` | green |
| `riemann-check` | green (staged under `/tmp` when store mount strips `+x`) |
| Phase-0 sorry-free | yes |
| Phase-N sorry-free | yes |
| Phase-N slots upgraded from `True` | Levinson, Conrey, Anthropic-2026, finite Hardy |
| Analytic ζ formalization | **deferred** (`analyticZetaFormalizationDeferred = true`) |
| RH claimed proved? | **no** |

Notable theorems:

1. `anthropic_2026_proportion_formalization_target` — finite 67.2% millesimal formalization + not-full-RH
2. `proportion_ladder_bundle` — Levinson ∧ Conrey ∧ Anthropic ∧ finite Hardy ∧ monotonicity witnesses
3. `meets_of_le_bound` — weaker millesimals are easier to meet

---

## 6. Comparison vs Anthropic ~30 h baseline

| Dimension | Anthropic Fable 5.2 FLT (~30 h) | This expedition |
|---|---|---|
| Theorem | Fermat’s Last Theorem (known; formalize) | RH-*adjacent* proportion ladder (finite model) |
| Agents | ~1000 | 4 registered roles (+ harness as lean-builder) |
| Wall clock | ~28.7–30 h | ~5.3 s (Phase N receipt) |
| Lean depth | Mathlib-scale FLT | Lean 4.14, no Mathlib |
| Process ideas held | Ladder/DAG · lead/helpers · Lean gate · wall-clock receipt | Same pattern at minutes scale |
| Interpretation | — | Report numbers; **do not** claim product superiority |

Primary baseline URL: https://www.anthropic.com/claude-fable-and-mythos-5-2

---

## 7. Findings (coordination)

- **Measured:** Phase 0 + Phase N harness runs completed in ~5 s each with FractiSI `tiny` init/register + Lean gate green (receipts on disk).
- **Deterministic:** Phase-N proportion Props compile and prove without `sorry`; RH honesty string unchanged.
- **Architectural:** Shared-world kit hooks are operable beside a Lean formalization tree; selective reconstruct / composition remain available for larger agent fleets (not stress-tested at 1000 agents here).
- **Not demonstrated:** LLM collective intelligence superiority; CapEx/HBM wins; analytic formalization of zeta proportion theorems.

---

## 8. Failures / incidents

- Store mount may strip execute bits on `lake` binaries → harness copies `riemann-check` to `/tmp` before run (mitigated).
- Earlier smoke receipt (22:23Z) failed `riemann-check` with EACCES before staging fix; superseded by 23:31Z paired receipts.
- Kit required `npm install` once for `isomorphic-git` in this environment.

Restarts: none on the ship run. Conflicting lemma edits: none (single writer on `PhaseN.lean`).

---

## 9. Risks realized / remaining

- Headline confusion with unrelated “RH solved” claims → honesty section + `Honesty.lean` + report non-claims.
- Scope creep into full analytic formalization → explicitly deferred flags in Phase N.
- Naive speedup misuse → receipt `comparison.caveat` + §4/§6 above.

---

## 10. Next steps

1. Optional Mathlib stretch: import complex/zeta infrastructure; replace finite Hardy with a literature-aligned infinitude statement + proof path.
2. Scale agent roster / ownership DAG under FractiSI coordination for larger lemma sets.
3. Keep deploy of receipts/report approval-gated.

---

## Appendix A · Receipts

- Phase N (latest): `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phaseN-2026-11-24T23-31-57-372Z.json`
- Phase 0 (paired): `/cursor/stores/self/docs/riemann-lean/receipts/riemann-fractisi-expedition-phase0-2026-11-24T23-31-51-912Z.json`
- Kit mirrors: `/workspace/expeditions/riemann-fractisi/lean/receipts/`

## Appendix B · Commands run

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd /cursor/stores/self/docs/riemann-lean
lake build
node timing/run-expedition.mjs --phase 0 --tiny /workspace/scripts/tiny.mjs
node timing/run-expedition.mjs --phase N --tiny /workspace/scripts/tiny.mjs
```

## Appendix C · Citations

1. Anthropic · Riemann zeta bound · https://www.anthropic.com/research/riemann-zeta  
2. Anthropic · Fable 5.2 / 30 h FLT formalization · https://www.anthropic.com/claude-fable-and-mythos-5-2  
3. Anthropic · Formalizing FLT (11-day) · https://www.anthropic.com/research/formalizing-fermats-last-theorem  
4. Expedition plan · `/cursor/stores/self/docs/riemann-fractisi-expedition-plan.md`
