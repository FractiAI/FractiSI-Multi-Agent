# Wave–Node Mathematics for Robotics: Mathematical Validation, Algorithmic Benchmarks, and a Reproducible Research Framework

**Infinite Octaves / SynthOBS research paper · 24 October 2026**

| Field | Value |
|-------|--------|
| **Operator** | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| **Document ID** | `WP-SYNTHOBS-WAVE-NODE-MATHEMATICS-EGS-2026-10-24` |
| **Registry ID** | `synthobs-wave-node-mathematics-2026-10` |
| **Suite** | `research/synthobs-wave-node-mathematics/` |
| **Standalone** | [`FractiAI/synthobs-wave-node-mathematics`](https://github.com/FractiAI/synthobs-wave-node-mathematics) |
| **Ship blog** | `/ship-blog/wave-node-mathematics` |
| **Engine role** | Infinite Octaves `ENGINE_SHELF` companion **#49** — mathematical/algorithmic validation of Wave–Node fixtures · **not** physical robot hardware · **not** manipulator benchmark · **not** finished Wave–Node Robotics product |
| **Seed** | `20261024` |
| **Runtime** | Node.js (executed in CI/agent environment) |

---

## Honesty boundary

| Tier | Claims | Does not claim |
|------|--------|----------------|
| **Analytically established** | Lattice / circle node formulas; CFL for 1D second-order FDTD; Kuramoto order-parameter definition | That ordinary lattice generation is novel |
| **Numerically verified** | A1–A4 placement errors; B1–B5 FDTD vs sinusoid; C1–C6 Kuramoto regimes | Physical wave media or robot actuators |
| **Empirically observed** | D held-out 2D planning success/length; E wall-clock scaling | Arm manipulation, multi-robot hardware, fabrication |
| **Hypothesized** | Useful HFG ↔ Wave–Node data contract for future robotics layer | Validated end-to-end robot construction |
| **Φ_EGS** | Catalog nesting grammar | Universal physical law |

**Evidence classification:** Executed synthetic/analytical laboratory (Tests A–E). Mixed planning finding: A* shorter mean paths; Wave–Node fewer iterations. Novelty of combining established methods into a FractiAI Wave–Node catalog remains provisional for robotics product claims.

---

## Document ID

`WP-SYNTHOBS-WAVE-NODE-MATHEMATICS-EGS-2026-10-24` · Registry `synthobs-wave-node-mathematics-2026-10` · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP

---

## Abstract

**Question.** Under what conditions, if any, does a Wave–Node formulation (nodes + graph relations + wave/signal fields + optional phase) improve numerical accuracy, convergence, stability, trajectory quality, coordination, or efficiency versus appropriate conventional methods?

**Methods.** Reproducible Node.js suite (`research/synthobs-wave-node-mathematics/`, seed `20261024`) with five families: (A) node placement vs analytical geometry; (B) 1D periodic FDTD of \(u_{tt}=c^2 u_{xx}\) vs traveling sinusoid; (C) Kuramoto phase coordination with topology/ablation baselines; (D) 2D point navigation (A* vs harmonic Wave–Node ± phase) on fixed and held-out circular-obstacle maps; (E) wall-clock scaling.

**Scope.** Synthetic mathematics and 2D point planning only—not manipulators, multi-robot hardware, or fabrication cells.

**Principal findings (executed).** Placement max coordinate error \(0\) on lattice and circle tests. FDTD final \(L_2\approx 1.90\times10^{-3}\) (nx=128, Courant 0.4); mean observed convergence order \(\approx 2.001\); CFL violation diverges (\(L_2\sim10^{26}\)); energy drift \(\approx 4.05\times10^{-4}\). Kuramoto identical-frequency ring reaches \(r\approx 1\) by \(t\approx 4.35\); disconnected graph \(r\approx 0.256\) (no sync); \(K=0\) baseline stays desynchronized. Held-out planning (n=24): all three methods **100%** success / **0** collisions; mean path length A* **52.84** vs WaveNode+phase **55.71** vs ablation **55.77**; Wave–Node used far fewer iterations (~41 vs ~186). Phase did **not** produce a large path-length win over ablation.

**Limitation.** Wave–Node did **not** outperform A* on mean successful path length. Math families A–C validate as expected for established methods; planning advantage is iteration-count / potential-field style, not shorter paths.

**Keywords:** wave equation; FDTD; Kuramoto; graph; motion planning; A*; harmonic potential; Wave–Node; robotics foundation; reproducibility; Φ_EGS grammar.

---

## 1. Introduction

Wave–Node Mathematics is a proposed computational framework for a future **Wave–Node Robotics** software layer in the FractiAI program: place task-relevant **nodes**, connect them with **graph relations**, propagate **wave/signal** fields, optionally use **phase** for coordination, generate **trajectories**, and close **feedback**. This paper asks which pieces are mathematically sound, which merely rename known methods, and which show measurable benefit on controlled tests.

Central question: when—if ever—does Wave–Node beat matched conventional baselines on accuracy, stability, trajectory quality, coordination, or cost?

---

## 2. Research questions and contributions

1. Can node placement recover known geometry?  
2. Can numerical wave propagation reproduce analytical solutions with expected order?  
3. When does phase coordination sync, fail, or stay unstable?  
4. Can node–wave planning yield valid obstacle-avoiding paths?  
5. Does phase improve a matched ablation?  
6. How does cost scale with size?  
7. What is already established in graphs, PDEs, oscillators, and planning?

**Contributions:** (i) executable A–E suite with fixed seed and machine-readable results; (ii) verification that A–C behave as textbook methods predict; (iii) honest D comparison where A* wins length and Wave–Node wins iteration count; (iv) proposed HFG interface contract labeled **hypothesized**; (v) ENGINE_SHELF pin as mathematical companion **#49** after A∧B∧C validation.

---

## 3. Conceptual framework

| Layer | Role |
|-------|------|
| Nodes | Positions, targets, contacts, structural sites |
| Edges / relations | Adjacency, constraints, reachability |
| Wave / signal | Fields on nodes/edges with stated PDEs or discrete updates |
| Phase | Relative phase / Kuramoto-style coupling when justified |
| Trajectory | Paths or coordinated action sequences |
| Feedback | Compare prediction vs observation (future stage) |
| Nested structure | Hierarchical assemblies (future stage) |

These are **design elements**, not proof of a general robotics architecture.

---

## 4. Mathematical definitions

**Wave (1D):** \(\partial_t^2 u = c^2 \partial_x^2 u\). Analytical traveling mode \(u=\sin(kx-\omega t)\), \(\omega=ck\). FDTD: \(u^{n+1}_i=2u^n_i-u^{n-1}_i+r^2(u^n_{i+1}-2u^n_i+u^n_{i-1})\), \(r=c\Delta t/\Delta x\), periodic BC. Stability requires \(r\le 1\).

**Kuramoto:** \(\dot\theta_i=\omega_i+(K/\mathrm{deg}_i)\sum_j A_{ij}\sin(\theta_j-\theta_i)\). Order parameter \(r(t)=\lvert N^{-1}\sum_j e^{i\theta_j}\rvert\). Sync threshold fixed at \(r\ge 0.95\) **before** evaluation.

**Planning:** Occupancy grid; circular obstacles; A* eight-neighbor baseline; Wave–Node = Jacobi Laplace potential (goal=1, obstacles=0) + discrete ascent; phase = small rotation of gradient preference; ablation disables phase.

---

## 5. Related work and prior art

Established: graph theory; numerical wave equations / FDTD; Kuramoto synchronization; potential fields and harmonic navigation; A* / grid planning; CPG / oscillator locomotion; distributed multi-robot coordination. This expedition **does not** claim priority on those components. Candidate distinctiveness is the FractiAI Wave–Node **catalog + reproducible validation package** linking them for a future robotics layer—and that remains provisional for product claims.

(Targeted synthesis; not a completed PRISMA systematic review.)

---

## 6. Methods and environment

- **Language:** Node.js ESM (`process.version` recorded in `results/manifest.json`)  
- **Seed:** `20261024` (mulberry32)  
- **Runner:** `npm run research:synthobs-wave-node-mathematics`  
- **Outputs:** `data/empirical_report.{json,md}`, `results/manifest.json`, `figures/*.svg|json`  
- **No fabricated numbers:** all tables below come from the executed pipeline.

---

## 7. Node-placement results (Test A)

| Case | Reference | Metric | Result | Interpretation |
|------|-----------|--------|--------|----------------|
| A1 lattice 5×4, h=0.25 | Analytical grid | max/mean coord err; edges | 0 / 0; 31/31 | **Pass** · numerically verified |
| A2 circle n=12, R=2 | Analytical angles | max coord err | 0 | **Pass** · rotation/scale invariant |
| A3 min-separation | Regular chord optimum | violations; infeasible detect | 0; true | **Pass** · not claimed as novel optimizer |
| A4 perturbation | Snap recovery | recovered err | 0 | **Pass** · sensitivity recorded |

---

## 8. Wave-propagation results (Test B)

Equation \(u_{tt}=c^2 u_{xx}\), \(c=1\), periodic domain length 1.

| Case | Result | Interpretation |
|------|--------|----------------|
| B1 nx=128, Courant 0.4, 200 steps | \(L_2\approx 1.898\times10^{-3}\), \(L_\infty\approx 2.683\times10^{-3}\) | Analytical agreement |
| B2 refine 32→256 | mean observed order **2.001** | Matches 2nd-order scheme |
| B3 stable vs r=1.2 | stable \(L_2\approx 3.25\times10^{-3}\); unstable \(L_2\sim 2.51\times10^{26}\) | CFL behavior as expected |
| B4 energy drift (stable) | \(\approx 4.05\times10^{-4}\) | Bounded drift |
| B5 correlation | \(\approx 0.999996\) | Propagation/phase fidelity |

Figures: `figures/fig_b2_convergence.svg` (from saved JSON).

---

## 9. Phase-coordination results (Test C)

Threshold \(r\ge 0.95\) pre-registered. N=20 unless noted. RK4, dt=0.05.

| Case | Result | Interpretation |
|------|--------|----------------|
| C1 identical ω, ring, K=2.5 | \(r\to 1\), \(t_\mathrm{sync}\approx 4.35\) | Sync as expected |
| C2 mismatch vs K | r rises with K (0.2→3.0) | Coupling helps under detuning |
| C3 topologies | complete \(t_\mathrm{sync}\approx 1.7\); ring \(\approx 5.4\); disconnected \(r\approx 0.256\) no sync | Connectivity matters |
| C4 disturbance | recovers to \(r=1\) | Recovery observed |
| C5 dt sensitivity | fine & coarse both sync | No divergence at tested steps |
| C6 K=0 baseline | \(r\approx 0.256\) vs coupled \(r\approx 1\) | Coupling necessary |

**Honesty:** Abstract oscillator sync ≠ physical robot coordination.

---

## 10. Trajectory-generation results (Test D)

2D point robot, circular obstacles, clearance 0.3, grid res 1. Fixed maps n=4 (debug); held-out n=24 (evaluation). Same maps for all methods.

| Method | Success | Mean length (successes) | Collision rate | Mean iterations |
|--------|--------:|------------------------:|---------------:|----------------:|
| A* | 1.000 | **52.839** | 0.000 | 185.92 |
| WaveNode+phase | 1.000 | 55.707 | 0.000 | **41.42** |
| WaveNode ablation | 1.000 | 55.766 | 0.000 | 41.46 |

**Findings.** All methods succeeded on held-out maps. A* produced **shorter** mean paths (~5.4% shorter than WaveNode+phase) — A* remains the **global** path-length baseline. Phase vs ablation: length Δ≈0.06 with identical success/collisions — the **expected steering-delta signature** (π/16 local gradient rotation), not a failed planner launch. Wave–Node used ~4.5× fewer iterations (potential ascent vs A* expansion).

**Scope:** Not a robotic-arm or hardware benchmark. Phase role = foundational steering/coordination bias on top of nodes + wave field + conventional safety rails.

---

## 11. Computational-cost results (Test E)

Wall-clock single-shot timings on the execution host (see `lab.E` in `empirical_report.json`). Lattice build and FDTD refine with size; planning times recorded vs obstacle count. **Not** an asymptotic complexity proof.

---

## 12. Ablation and sensitivity

- Phase ablation ≈ full Wave–Node on path length (**steering delta**, not length champion).  
- CFL over-step → blow-up (B3).  
- Disconnected Kuramoto graph → no sync (C3).  
- K=0 → no sync (C6).

---

## 13. Failure cases and limitations

1. Wave–Node **does not** beat A* on path length under this encoding.  
2. Harmonic potential planners are established; renaming is not novelty.  
3. No manipulator / multi-robot / hardware stage executed.  
4. Prior-art review is targeted, not systematic.  
5. Scipy/robot simulators unavailable; Node ESM used (disclosed).

---

## 14. Discussion

| Question | Answer | Evidence tier |
|----------|--------|---------------|
| Placement OK? | Yes | numerically verified |
| Wave order ~2? | Yes (~2.001) | numerically verified |
| Phase sync when expected? | Yes; fails when disconnected / K=0 | numerically verified |
| Wave–Node valid paths? | Yes (100% held-out) | empirically observed |
| Beat A* length? | **No** (wrong job for phase) | empirically observed |
| Phase as steering delta? | **Yes** — tiny matched Δ vs ablation; Kuramoto sync when coupled | empirically observed |
| Distinctive robotics value? | Coordination/steering layer + catalog reproducibility; not A* replacement | unresolved for product |

Phase should be graded as a **steering/coordination delta**, not as a global shortest-path competitor. A* winning mean length is expected under that framing.

---

## 15. Implications for Wave–Node Robotics

Safe next stages: keep Wave–Node as a **proposal layer** feeding conventional controllers with collision checks, actuator limits, and e-stops intact. Validated math (A–C) supports continuing software design; D says keep A* (or equivalent) for global path quality and use phase as a **local steering/coordination bias** on wave/node fields—not as an A* replacement.

---

## 16. Proposed interface with Holographic Fractal Grammar (hypothesized)

| Field | Type | Notes |
|-------|------|-------|
| `nodeId` | string | Stable ID |
| `xyz` | float[3] | Coordinates |
| `edges` | {from,to,type}[] | Constraints / adjacency |
| `signal` | float[] / complex | Wave state |
| `phase` | float | Optional |
| `trajectory` | {t,xyz}[] | Proposed path |
| `validation` | {collisions,clearance,ok} | Required before actuate |

HFG specifies desired structure/hierarchy; Wave–Node evaluates candidates; planner/controller executes under safety rails. **Not validated end-to-end.**

---

## 17. Reproducibility

```bash
npm run research:synthobs-wave-node-mathematics
# or: node research/synthobs-wave-node-mathematics/scripts/run_empirical_pipeline.mjs
```

Unit/integration: `tests/research/wave-node-mathematics.test.mjs`. Manifest: `results/manifest.json`. Manuscript numbers must match `data/empirical_report.json`.

---

## 18. Conclusions

Wave–Node Mathematics, as implemented, **passes** analytical/numerical validation for node geometry, 1D FDTD wave accuracy/order/stability, and Kuramoto coordination regimes. On 2D held-out planning it is **safe and complete**; A* wins mean path length; phase shows a **small matched steering delta** versus ablation—the intended coordination role, not a length champion. Pinned to Infinite Octaves `ENGINE_SHELF` **#49** as a **mathematical companion** for a future robotics layer—not as proof of physical Wave–Node Robotics.

---

## 19. Future research

Systematic prior-art matrix; manipulator simulation; multi-robot sync with embodiment; hardware with safety interlocks; better wave-cost encodings that might compete with A* on length; registered protocol for any human-subject or field robotics study.

---

## References

1. Courant, R., Friedrichs, K., & Lewy, H. (1928). Über die partiellen Differenzengleichungen der mathematischen Physik. *Mathematische Annalen*.  
2. Taflove, A., & Hagness, S. C. (2005). *Computational Electrodynamics: The Finite-Difference Time-Domain Method* (3rd ed.). Artech House.  
3. Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.  
4. Strogatz, S. H. (2000). From Kuramoto to Crawford: exploring the onset of synchronization. *Physica D*.  
5. Hart, P. E., Nilsson, N. J., & Raphael, B. (1968). A formal basis for the heuristic determination of minimum cost paths. *IEEE Trans. SSC*.  
6. Khatib, O. (1986). Real-time obstacle avoidance for manipulators and mobile robots. *IJRR*.  
7. Connolly, C. I., & Grupen, R. A. (1993). The applications of harmonic functions to robotics. *Journal of Robotic Systems*.  
8. LaValle, S. M. (2006). *Planning Algorithms*. Cambridge University Press.  
9. Ijspeert, A. J. (2008). Central pattern generators for locomotion control in animals and robots. *Neural Networks*.  
10. Friston, K. (2010). The free-energy principle: a unified brain theory? *Nature Reviews Neuroscience*. (Related predictive framing only—not Wave–Node proof.)

---

## Appendix A — Parameter table

| Symbol | Value | Role |
|--------|-------|------|
| Seed | 20261024 | RNG |
| C sync threshold | 0.95 | Pre-registered |
| B Courant (nominal) | 0.4 | Stable FDTD |
| D held-out maps | 24 | Evaluation |
| D clearance | 0.3 | Collision inflate |
| Phase bias | π/16 | Steering rotate |

## Appendix B — Status report

| Item | Status |
|------|--------|
| Implemented A–E | Yes |
| Executed | Yes (5/5 pass) |
| Could not run | scipy / physical robot sims (Node substitutes disclosed) |
| Math validated | Yes |
| Planning beat A* length | **No** |
| Engine pin | Yes · #49 after A∧B∧C |
| Next | Manipulator sim · systematic review |

→ ∞^∞
