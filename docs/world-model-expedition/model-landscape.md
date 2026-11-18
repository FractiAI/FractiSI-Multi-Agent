# World-model landscape for a fair multi-agent shared-world benchmark

**As of:** 2026-11-18  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Purpose:** Candidate survey for a fair multi-agent shared-world expedition. Prefer systems that can be run, stubbed with published metrics, or used as literature baselines — not marketing slides.

## Honesty rail (read first)

1. **Marketing ≠ evidence.** Vendor blogs claim “world models,” “shared worlds,” and “minutes of consistency.” Treat those as claims until open code, weights, or reproducible metrics exist.
2. **Pixel generators ≠ shared state.** MultiWorldBench (arXiv:2610.11723; eval code Apache-2.0 at `clipspark/multiworldbench`) shows open multiplayer video models still score ~21/100 overall vs Engine GT ~92, with **≤8** on state persistence and **~0** on spatial reasoning / building-ID revisit. Generation ≠ object permanence.
3. **Executable for this expedition** means: open (or obtainable) weights/code, runnable on commodity or documented GPU/CPU, and adaptable to a common WORLD interface — or a **fair stub** with published metrics. Closed cloud demos are **NOT EXECUTABLE** here even if impressive.
4. **License stack matters.** NVIDIA Open Model License / OpenMDW-1.1 / CC BY-NC-SA / MIT / Apache-2.0 are not interchangeable. RoboJEPA is **non-commercial**.

### Common WORLD interface (target)

| Method | Intent |
|--------|--------|
| `observe` | Per-agent observation (pixels / latent / structured) |
| `read_state` | Read shared world state (graph / blackboard / latent) |
| `write_state` | Propose or apply a state mutation |
| `predict` | One-step / short-horizon next-state prediction |
| `simulate` | Multi-step rollout under actions |
| `share` | Publish state/observation to other agents |
| `fork` | Branch a world copy for imagination / counterfactual |
| `merge` | Reconcile forks or concurrent writes |
| `materialize` | Commit imagined trajectory into canonical world |
| `reset` | Restore initial or checkpointed world |

---

## Executive ranking (expedition usefulness)

| Priority | Candidate | Verdict | Why |
|----------|-----------|---------|-----|
| P0 | **Structured blackboard / shared state graph** | **EXECUTABLE** | Full WORLD ops; CPU; fair shared-world GT |
| P0 | **DreamerV3** | **EXECUTABLE** | MIT; local; imagination = `predict`/`simulate`/`fork` |
| P0 | **TD-MPC2** | **EXECUTABLE** | MIT; 324 checkpoints; latent MPC |
| P0 | **MuZero (open reimpl.)** | **EXECUTABLE** | MIT educational reimpl.; discrete MCTS planning |
| P1 | **V-JEPA 2 / V-JEPA 2-AC** | **EXECUTABLE** (GPU) | MIT weights+code; latent action world model |
| P1 | **DIAMOND** | **EXECUTABLE** (GPU) | MIT; playable Atari/CS:GO diffusion WM |
| P1 | **Oasis 500M** | **EXECUTABLE** (GPU) | MIT; Minecraft DiT; single-player |
| P1 | **MineWorld** | **CONDITIONAL** | MIT code; HF checkpoints reported taken down (May 2025) — verify before counting |
| P1 | **Solaris** | **EXECUTABLE** (heavy GPU ≥48GB) | Apache-2.0; multiplayer Minecraft WM + weights |
| P1 | **Gamma-World (γ-World)** | **EXECUTABLE** (heavy NVIDIA GPU) | Apache-2.0 code; HF weights; MultiWorldBench peer |
| P2 | **NVIDIA Cosmos Predict2 / Predict2.5** | **EXECUTABLE** (Ampere+ ≥26–57GB) | Open code+weights; video prediction / action-conditioned samples |
| P2 | **NVIDIA Cosmos 3** | **EXECUTABLE** (H100/H200/B200 or Jetson Edge) | OpenMDW-1.1; omnimodal MoT; not a drop-in multi-agent shared blackboard |
| P2 | **RoboJEPA** | **EXECUTABLE** (restricted) | CC BY-NC-SA 4.0 — research-only |
| P3 | **Genie 3 / Project Genie** | **NOT EXECUTABLE** | Proprietary; Ultra / Labs prototype; no weights |
| P3 | **Genie 4** | **NOT EXECUTABLE** | Research preview / waitlist; no weights; multi-agent still listed as open challenge |

---

## Candidate records

### 1. Google DeepMind Genie 3 / Project Genie

| Field | Record |
|-------|--------|
| **Architecture** | Autoregressive interactive world model (video frames conditioned on growing trajectory + user actions). Exact architecture not fully public. Project Genie couples Genie 3 with Nano Banana Pro + Gemini for sketching/remix. |
| **Representation** | Pixel / video world (720p claimed); no public structured state API. |
| **Training paradigm** | Proprietary large-scale video / interaction training (details not open). |
| **Modalities** | Text prompt → interactive visual world; keyboard/mouse navigation; image-conditioned sketching in Project Genie. **No native audio** in Genie 3 announcements. |
| **Action support** | Real-time navigation; constrained direct action space; “promptable events” exist in model claims but **not all** shipped in Project Genie prototype (Labs notes missing capabilities). |
| **Prediction horizon** | Real-time ~24 FPS; claimed visual consistency for **several minutes**; memory window ~**1 minute** (DeepMind Genie 3 blog, Aug 2025). |
| **Persistence / object permanence** | Improved vs Genie 2 demos; still limited session length; not a verified multi-agent shared store. DeepMind lists multi-agent shared environments as ongoing research. |
| **Controllability** | Strong for navigation demos; weaker for agent-authored physics edits; character control latency/fidelity issues acknowledged in Project Genie notes. |
| **Availability** | Genie 3 announced Aug 2025; Project Genie rolled to Google AI Ultra (US 18+) Jan 2026 as Labs prototype. |
| **Licensing** | Proprietary. |
| **Hardware** | Cloud-only (Google). |
| **API requirements** | Consumer Ultra / Labs access; no public developer weights API for fair offline bench as of this survey. |
| **Open weights / code** | **No.** |
| **Reproducibility** | Demo / blog only. No peer-reproducible training recipe. |
| **Benchmarks** | Marketing / qualitative demos; not MultiWorldBench-evaluated publicly. |
| **WORLD interface fit** | Partial `observe`/`simulate` via UI; **no** `read_state`/`write_state`/`fork`/`merge`/`materialize` as first-class APIs. |
| **Expedition verdict** | **NOT EXECUTABLE** (literature / closed demo only). Fair to cite as frontier upper-bound narrative, not as a runnable arm. |

### 2. Google DeepMind Genie 4

| Field | Record |
|-------|--------|
| **Architecture** | Next-gen interactive world simulator; natively multimodal; builds on **Gemini** family (Gemini Omni for appearance/behavior; other Gemini models for coherence/reasoning). Exact weights/architecture closed. |
| **Representation** | Interactive audiovisual simulation; still frame/video-centric, not an open shared graph. |
| **Training paradigm** | Proprietary; Gemini-coupled. |
| **Modalities** | Vision + **audio** (music, ambient, dialogue) claimed; text/prompt editing; camera/agent control. |
| **Action support** | Real-time interaction; event prompting; complex multi-agent interaction still an **explicit limitation**. |
| **Prediction horizon** | Continuous interaction for **a few minutes** (DeepMind Genie 4 model page, Oct 2026). |
| **Persistence / object permanence** | DeepMind states visual details and object permanence **can shift/drift**, worse on long runs, complex prompt edits, or navigation. |
| **Controllability** | Improved realism claims; character/physics fidelity still research-grade. |
| **Availability** | Announced ~2026-10-27; research preview for trusted testers; planned Ultra / Gemini API / AI Studio early access; waitlist. |
| **Licensing** | Proprietary; SynthID watermarking on outputs. |
| **Hardware** | Cloud-only. |
| **API requirements** | Waitlist / partner access; no public open weights. |
| **Open weights / code** | **No.** |
| **Reproducibility** | Preview demos + limitation statements only. |
| **Benchmarks** | Internal safety evals mentioned; no public shared-world scorecard comparable to MultiWorldBench. |
| **WORLD interface fit** | Same gap as Genie 3: immersive `observe`/`simulate`, weak structured `read_state`/`write_state`/`merge`. |
| **Expedition verdict** | **NOT EXECUTABLE**. Do not treat as a fair local baseline. |

### 3. NVIDIA Cosmos (Predict2 / Predict2.5 / Cosmos 3)

| Field | Record |
|-------|--------|
| **Architecture** | **Predict2 / Predict2.5:** diffusion WFMs for text→image and video/text→future video; action-conditioned sample (Bridge). **Cosmos 3 (May–Jul 2026):** unified Mixture-of-Transformers omnimodal family with Reasoner + Simulator-style towers (NVIDIA cosmos repo / tech report). Tiers: Super 64B, Nano 16B, Edge 4B. |
| **Representation** | Primarily visual latent / video tokens; Physical AI focus (robotics, AV). Not a multi-agent blackboard. |
| **Training paradigm** | Large-scale pretrain + post-training recipes (GR00T Dreams, Bridge action-conditioned, etc.). |
| **Modalities** | Text, image, video; Cosmos 3 marketed as omnimodal (vision/text reason + simulate/act). |
| **Action support** | Predict2 action-conditioned sample on Bridge; Cosmos Physical AI tooling for policy/sim. Not a general multi-player shared-state API. |
| **Prediction horizon** | Short video rollouts (seconds-scale clips typical of diffusion video WFMs); not hour-long shared worlds. |
| **Persistence / object permanence** | Video coherence within generated clips; **not** proven multi-view shared object permanence (see MultiWorldBench gap for generative WMs generally). |
| **Controllability** | Text/video conditioning strong; action conditioning available in samples; fine-tune supported. |
| **Availability** | Predict2 code+weights public (2025); Predict2.5 recommended migration; Cosmos 3 HF collections + cookbooks (2026). |
| **Licensing** | **Predict2 era:** code Apache-2.0; models NVIDIA Open Model License. **Cosmos 3 (current docs):** source + models under **OpenMDW-1.1** (permissive model materials; retain notices; clear third-party rights). Always re-read the LICENSE on the exact checkpoint. |
| **Hardware** | Predict2 2B ~26–33 GB; 14B ~49–57 GB; Ampere+. Cosmos3-Super: H200/B200/GB200; Nano: RTX Pro 6000/H100/B200; Edge: Jetson AGX Orin/Thor/RTX Pro 6000. |
| **API requirements** | Local HF/PyPI; optional NVIDIA cloud. Llama Guard 3 may ship as input filter (separate license). |
| **Open weights / code** | **Yes** (family-dependent repos: `nvidia/cosmos`, `nvidia-cosmos/cosmos-predict2`, `cosmos-predict2.5`). |
| **Reproducibility** | Strong relative to closed Genie: published checkpoints, post-train guides, performance matrices. Still GPU-heavy. |
| **Benchmarks** | Physical AI / robotics post-train demos; not MultiWorldBench leaderboard entry as Cosmos itself. |
| **WORLD interface fit** | Good `predict`/`simulate` on visual futures; weak native `read_state`/`write_state`/`share`/`merge` unless wrapped. |
| **Expedition verdict** | **EXECUTABLE** on suitable NVIDIA GPUs — treat as **visual future predictor / Physical AI WFM**, not as shared-world GT. Fair stub: wrap Predict2 action-conditioned as `predict` only. |

### 4. Meta V-JEPA 2 (and V-JEPA 2-AC / 2.1 / RoboJEPA)

| Field | Record |
|-------|--------|
| **Architecture** | Joint-Embedding Predictive Architecture on video (ViT encoder + predictor in latent space). **V-JEPA 2-AC:** action-conditioned latent world model post-trained for robot planning. **V-JEPA 2.1:** denser temporally consistent features (Mar 2026). **RoboJEPA:** predictors 22M–8B on frozen V-JEPA 2.1 encoder across embodiments. |
| **Representation** | **Latent** (not pixel decoder by default); planning via energy / CEM over predicted latents. |
| **Training paradigm** | Self-supervised video pretrain (internet-scale); AC fine-tune on ~62h DROID (Meta claim); RoboJEPA multi-embodiment robot data. |
| **Modalities** | Video; robot proprio/actions for AC; optional language probes / LLM pairing in Meta eval narrative. |
| **Action support** | V-JEPA 2-AC: 7-D end-effector + pose conditioned prediction; zero-shot robot planning demos. |
| **Prediction horizon** | Short-horizon latent rollouts for planning (task-scale seconds, not cinematic minutes). |
| **Persistence / object permanence** | Encodes dynamics useful for manipulation; **not** a multi-agent shared Minecraft-style persistent world. |
| **Controllability** | Strong in latent MPC / CEM planning settings; weak as open-world video game engine. |
| **Availability** | `facebookresearch/vjepa2` (MIT); HF collection; torch.hub; AC checkpoint `vjepa2-ac-vitg.pt`. RoboJEPA: `facebookresearch/robo_jepa`. |
| **Licensing** | V-JEPA 2 code/weights: **MIT** (some dataset utils Apache-2.0). **RoboJEPA: CC BY-NC-SA 4.0** (non-commercial). |
| **Hardware** | Consumer/pro GPU for ViT-L/H; giant/gigantic need more VRAM. Community GGUF/jepa.cpp enables CPU AC inference (third-party). |
| **API requirements** | Local PyTorch / HF; no paid API required. |
| **Open weights / code** | **Yes** (V-JEPA 2 / 2.1 / AC). RoboJEPA yes but NC. |
| **Reproducibility** | High for encoder features; robot zero-shot claims should be treated as paper/demo-scoped. |
| **Benchmarks** | Motion understanding / action anticipation SOTA claims; robot reaching/grasping/pick-place goal-image planning. |
| **WORLD interface fit** | Natural `observe`→encode, `predict`, `simulate` (latent), weak `share`/`merge`/`materialize` unless agents share latents explicitly. |
| **Expedition verdict** | **EXECUTABLE** (V-JEPA 2 / AC). Prefer AC for action-conditioned `predict`. Use RoboJEPA only if NC license is acceptable. |

### 5. DreamerV3

| Field | Record |
|-------|--------|
| **Architecture** | RSSM-style world model: encode observations → categorical latents; predict next latent + reward; actor-critic trained in imagination. |
| **Representation** | Discrete/categorical latent dynamics (+ reconstructed observations in some setups). |
| **Training paradigm** | Online MBRL; fixed hyperparameters across domains (Nature 2025 article / Hafner et al.). |
| **Modalities** | Pixels / proprio (env-dependent): Atari, DMC, Crafter, Minecraft-like, etc. |
| **Action support** | First-class discrete & continuous control via imagined rollouts. |
| **Prediction horizon** | Imagination horizons of tens of steps (config-dependent); not photoreal long video. |
| **Persistence / object permanence** | Latent persistence within episode; no cross-agent shared store by default. |
| **Controllability** | High for RL tasks; world is agent-centric. |
| **Availability** | `danijar/dreamerv3` (community reimpl. of V3; MIT). Also PyTorch ports / R2-Dreamer (ICLR 2026) baselines. |
| **Licensing** | MIT (danijar reimpl.). |
| **Hardware** | JAX; GPU preferred; `--jax.platform cpu` works for small envs. |
| **API requirements** | Local only. |
| **Open weights / code** | **Yes** (train from scratch; some third-party checkpoints). |
| **Reproducibility** | Strong on published env suites with configs; match paper seeds carefully. |
| **Benchmarks** | Crafter, Atari, DMControl, etc. (paper suite). |
| **WORLD interface fit** | Excellent `predict`/`simulate`/`fork` (imagination); `materialize` = act in real env; needs wrapper for multi-agent `share`/`merge`. |
| **Expedition verdict** | **EXECUTABLE** — primary open MBRL world-model arm. |

### 6. TD-MPC2

| Field | Record |
|-------|--------|
| **Architecture** | Implicit (decoder-free) latent world model + local trajectory optimization (MPC) with TD learning. |
| **Representation** | Compact latent state; no pixel decoder required. |
| **Training paradigm** | Online RL; single hyperparameter set across 104 tasks; multi-task models up to 317M. |
| **Modalities** | Continuous control observations (DMC, Meta-World, ManiSkill2, MyoSuite). |
| **Action support** | Continuous actions; cross-embodiment multi-task agents. |
| **Prediction horizon** | Local MPC horizons (short–medium). |
| **Persistence / object permanence** | Task-episode latent consistency; not multi-player shared world. |
| **Controllability** | Strong on continuous control benchmarks. |
| **Availability** | `nicklashansen/tdmpc2`; 324 checkpoints + large transition datasets (tdmpc2.com). |
| **Licensing** | **MIT** (third-party envs retain their licenses). |
| **Hardware** | Single GPU typical; 317M multi-task is heavier. |
| **API requirements** | Local. |
| **Open weights / code** | **Yes** (code + 324 checkpoints + datasets). |
| **Reproducibility** | Among the strongest open WM releases (checkpoints + data). |
| **Benchmarks** | 104 continuous-control tasks; multi-task 30/70/80-task scores published. |
| **WORLD interface fit** | Strong `predict`/`simulate` in latent space; `fork` via planning; multi-agent share needs external blackboard. |
| **Expedition verdict** | **EXECUTABLE** — best open continuous-control WM with published checkpoints. |

### 7. MuZero (where appropriate)

| Field | Record |
|-------|--------|
| **Architecture** | Representation → dynamics → prediction nets; MCTS planning in learned latent dynamics (DeepMind 2019). |
| **Representation** | Abstract latent state (no requirement to reconstruct pixels). |
| **Training paradigm** | Self-play / RL with reanalyze; discrete action focus in classic setting. |
| **Modalities** | Board games, Atari, simple Gym tasks in open reimpls. |
| **Action support** | Discrete (classic); continuous extensions exist in literature but not the fair default. |
| **Prediction horizon** | MCTS depth × learned dynamics; planning-centric. |
| **Persistence / object permanence** | Perfect within deterministic games; N/A for generative video worlds. |
| **Controllability** | Excellent in discrete perfect-information games. |
| **Availability** | Official DeepMind weights not generally open; **open reimplementation:** `werner-duvaud/muzero-general` (MIT, PyTorch+Ray). |
| **Licensing** | Reimpl MIT; paper proprietary lineage. |
| **Hardware** | CPU fine for CartPole/LunarLander; GPU for Atari-scale. |
| **API requirements** | Local. |
| **Open weights / code** | Code yes; “official Atari/Go giants” mostly **not** drop-in open. |
| **Reproducibility** | Educational reimpl reproduces small environments; do not claim DeepMind Superhuman parity without matching compute. |
| **Benchmarks** | Atari, board games (paper); CartPole/LunarLander/Breakout in muzero-general. |
| **WORLD interface fit** | Clean `predict`/`simulate`/`fork` inside MCTS tree; `merge` ≈ tree backup; not multi-agent shared pixel world. |
| **Expedition verdict** | **EXECUTABLE** as discrete planning baseline via open reimpl. Use for interface semantics, not photoreal shared worlds. |

### 8. Blackboard / shared state graph / structured agent environments

| Field | Record |
|-------|--------|
| **Architecture** | Classical **blackboard**: shared typed memory; knowledge sources (agents) read/write under control regime. Modern variants: versioned **state graphs**, Petri/colored Petri nets for concurrent actions, CAST-style team Petri nets with belief/control nodes, hub-and-spoke tool agents over HLPN traces. |
| **Representation** | Explicit entities, relations, events, locks, versions — **not** pixels. |
| **Training paradigm** | Usually **not** learned; engineered transition rules. Can host learned policies as writers. |
| **Modalities** | Structured symbols; optional bindings to sensors/renders. |
| **Action support** | Validated transitions; concurrent writes via schedules / Petri firing / CRDT-like merge policies. |
| **Prediction horizon** | Exact within the formal model; imagination = dry-run transitions. |
| **Persistence / object permanence** | **Native** — this is the point. Object identity is a first-class node ID. |
| **Controllability** | Maximal for fair multi-agent benchmarks: race conditions, locks, forks are testable. |
| **Availability** | Implementable in-repo (JSON/SQLite/graph DB); academic CPN tools; multi-agent envs (PettingZoo, Melting Pot, SMACv2) as **related** structured shared worlds (not classical blackboards, but executable shared-state tests). |
| **Licensing** | Implementation-dependent (prefer MIT/Apache for expedition code). |
| **Hardware** | CPU. |
| **API requirements** | None. |
| **Open weights / code** | N/A (spec + code). |
| **Reproducibility** | Highest — deterministic fixtures. |
| **Benchmarks** | MultiWorldBench **Engine GT** is the empirical proof that an engine/stateful world dominates generative WMs on shared-state metrics (~91.69 vs ~21). |
| **WORLD interface fit** | **Full coverage** of `observe`/`read_state`/`write_state`/`predict`/`simulate`/`share`/`fork`/`merge`/`materialize`/`reset` by construction. |
| **Expedition verdict** | **EXECUTABLE — recommended primary shared-world substrate.** Pair with learned WMs as predictors that propose writes, not as the source of truth. |

### 9. Other strong open / locally executable systems

#### 9a. Solaris (NYU) — multiplayer Minecraft video WM

| Field | Record |
|-------|--------|
| **Architecture** | Video DiT adapted from single-agent (Matrix-Game lineage) to multiplayer attention; staged bidirectional → causal → Self Forcing (+ Checkpointed Self Forcing). |
| **Representation** | Multi-view pixels + actions; JAX weights. |
| **Training paradigm** | 12.6M coordinated multiplayer frames via SolarisEngine; staged SP→MP. |
| **Modalities** | Dual (or multi) first-person video + keyboard/actions. |
| **Action support** | Per-player actions; coordinated multiplayer. |
| **Prediction horizon** | Autoregressive video blocks; research clip lengths. |
| **Persistence** | Better than SP baselines on consistency metrics in paper; MultiWorldBench still shows large shared-state gap vs Engine GT. |
| **Availability** | `solaris-wm/solaris` (Apache-2.0), engine repo, HF `nyu-visionx/solaris`. |
| **Hardware** | GPU inference documented at **≥48 GB** per device (batch 1). |
| **Expedition verdict** | **EXECUTABLE** if large GPU available; strongest **open multiplayer generative** peer alongside Gamma-World. |

#### 9b. Gamma-World (γ-World, NVIDIA Toronto Lab)

| Field | Record |
|-------|--------|
| **Architecture** | Causal multi-agent DiT; Simplex Rotary Agent Encoding; Sparse Hub Attention; distilled 24 FPS causal student. Built on Cosmos-Predict2.5 stack. |
| **Representation** | Synchronized multi-agent visual tokens + actions. |
| **Training paradigm** | Teacher bidirectional → causal → few-step distillation. |
| **Modalities** | Multi-agent video; text encoder via Cosmos-Reason1-7B. |
| **Action support** | Independently controllable agents; 2→4 player zero-shot scaling claim. |
| **Persistence** | MultiWorldBench shared-world track ~9.87 avg (best-ish among generative peers; still ≪ Engine GT). |
| **Availability** | `nv-tlabs/Gamma-World` Apache-2.0; HF `chijw/Gamma-World`. |
| **Hardware** | NVIDIA Ampere+; CUDA 12.8; research Beta. |
| **Licensing** | Code Apache-2.0; also pulls Cosmos-Reason1 (NVIDIA model license) — accept terms. |
| **Expedition verdict** | **EXECUTABLE** on suitable NVIDIA GPUs; use as multi-agent generative arm + MultiWorldBench metrics stub. |

#### 9c. Oasis 500M (Decart / Etched)

| Field | Record |
|-------|--------|
| **Architecture** | ViT autoencoder + DiT backbone; Diffusion Forcing; autoregressive action-conditioned frames. |
| **Representation** | Minecraft-like pixels. |
| **Availability** | `etched-ai/open-oasis` + HF `Etched/oasis-500m` — **MIT**. Larger realtime demo is **not** the open 500M. |
| **Hardware** | Consumer/pro GPU for 500M inference. |
| **Expedition verdict** | **EXECUTABLE** single-player visual WM; not multi-agent shared state. |

#### 9d. MineWorld (Microsoft)

| Field | Record |
|-------|--------|
| **Architecture** | Visual-action autoregressive Transformer; Diagonal Decoding for 4–7 FPS. |
| **Availability** | `microsoft/mineworld` MIT; HF checkpoints **reported temporally taken down (May 2025)** — verify before planning. |
| **Hardware** | A100/H100 class recommended by authors. |
| **Expedition verdict** | **CONDITIONAL EXECUTABLE** — code yes; weights may be unavailable. |

#### 9e. DIAMOND

| Field | Record |
|-------|--------|
| **Architecture** | Diffusion world model over pixels (EDM-style); agent trained inside dreams. |
| **Benchmarks** | Atari 100k mean HNS 1.46 (NeurIPS 2024 Spotlight claim for agents trained entirely in WM). |
| **Availability** | `eloialonso/diamond` MIT; pretrained Atari + CS:GO playable WMs. |
| **Expedition verdict** | **EXECUTABLE** visual WM / neural game engine baseline (single-agent). |

#### 9f. MultiWorldBench (eval harness)

| Field | Record |
|-------|--------|
| **Role** | Diagnostic Minecraft bench: navigation, shared world, revisit (495 configs / 10 capabilities). |
| **Availability** | `clipspark/multiworldbench` — **eval protocol only** (Apache-2.0); no weights/training. |
| **Key result** | Engine GT 91.69 · Gamma-World 21.39 · Solaris MP 20.88 · Solaris SP 10.06. |
| **Expedition verdict** | **EXECUTABLE as scoring protocol**; use published numbers as fair stubs when models cannot be run. |

---

## WORLD interface coverage matrix

Legend: ● native / easy · ◐ partial / wrapper · ○ absent / closed

| System | observe | read_state | write_state | predict | simulate | share | fork | merge | materialize | reset | Local? |
|--------|:-------:|:----------:|:-----------:|:-------:|:--------:|:-----:|:----:|:-----:|:-----------:|:-----:|:------:|
| Blackboard / state graph | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | **Yes** |
| DreamerV3 | ● | ◐ latent | ◐ via act | ● | ● | ○ | ● | ○ | ● env | ● | **Yes** |
| TD-MPC2 | ● | ◐ latent | ◐ via act | ● | ● | ○ | ● | ○ | ● env | ● | **Yes** |
| MuZero (open) | ● | ◐ latent | ◐ via act | ● | ● | ○ | ● | ◐ MCTS | ● env | ● | **Yes** |
| V-JEPA 2-AC | ● | ◐ latent | ○ | ● | ● | ◐ share latents | ● | ○ | ◐ robot | ● | **Yes** |
| Cosmos Predict2/3 | ● | ○ | ○ | ● | ● | ○ | ◐ | ○ | ○ | ● | **GPU** |
| Solaris | ● | ○ | ○ | ● | ● | ◐ multi-view | ◐ | ○ | ○ | ● | **Heavy GPU** |
| Gamma-World | ● | ○ | ○ | ● | ● | ◐ multi-agent | ◐ | ○ | ○ | ● | **Heavy GPU** |
| Oasis / DIAMOND / MineWorld | ● | ○ | ○ | ● | ● | ○ | ◐ | ○ | ○ | ● | **GPU** |
| Genie 3/4 | ● | ○ | ○ | ● | ● | ○ | ○ | ○ | ○ | ◐ | **No** |

---

## Recommended expedition configuration (honest)

1. **Source of truth:** structured blackboard / state graph (full WORLD API).  
2. **Learned predictors (fair, local):** DreamerV3 + TD-MPC2 (+ MuZero discrete control).  
3. **Latent visual dynamics (optional GPU):** V-JEPA 2-AC.  
4. **Multi-agent generative stress tests (if H100-class available):** Solaris and/or Gamma-World, scored with MultiWorldBench protocol or **published stubs**.  
5. **Physical AI video futures (optional):** Cosmos Predict2.5 / Cosmos 3 Nano — wrap as `predict` only.  
6. **Literature ceiling only:** Genie 3/4 — cite limitations (minutes-scale, drift, multi-agent unsolved) without pretending local parity.

### Fairness rules for comparisons

- Same WORLD API adapters; no vendor UI privilege.  
- Separate tracks: **structured shared state** vs **generative multi-view video**.  
- When weights unavailable, use **published metrics** (e.g. MultiWorldBench table) rather than anecdotes.  
- Do not upgrade Soft Story / Soft Story marketing into empirical wins.

---

## Primary sources (accessed ~2026-11-18)

- DeepMind Genie 3 blog; Genie 4 blog + model page; Google Project Genie Labs post (2026-01-29).  
- NVIDIA Cosmos GitHub / docs (Predict2 matrix, OpenMDW-1.1 / Open Model License notes); Cosmos 3 announcements.  
- Meta V-JEPA page; `facebookresearch/vjepa2`; `facebookresearch/robo_jepa`.  
- `danijar/dreamerv3`; `nicklashansen/tdmpc2`; `werner-duvaud/muzero-general`.  
- `solaris-wm/solaris`; `nv-tlabs/Gamma-World`; MultiWorldBench arXiv:2610.11723 + `clipspark/multiworldbench`.  
- `etched-ai/open-oasis`; `microsoft/mineworld`; `eloialonso/diamond`.

---

*Document ID: `world-model-expedition/model-landscape` · SynthOBS landscape survey · claims tier = literature + availability audit (not new empirical runs).*

→ ∞^∞
