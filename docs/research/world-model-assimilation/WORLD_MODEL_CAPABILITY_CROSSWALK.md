# World Model Capability Crosswalk

**Document ID:** `world-model-capability-crosswalk-2026-11`  
**Maps to FractiSI named surfaces** (research still references Layer A–F for the initiative brief).

## Classification key

| Code | Meaning |
|------|---------|
| A | Adopt directly |
| B | Adapt into existing FractiSI architecture |
| C | Build independent FractiSI implementation of the idea |
| D | Integrate as optional external model |
| E | Research further |
| F | Reject |

## Matrix

| Technique | Project / source | Paper / location | Original purpose | Algorithm / structure | Compute | License | FractiSI equivalent | Potential improvement | Complexity | Expected impact | Validation | Class | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Shared template + field delta + selective reconstruct | FractiSI Tiny Gateway | `src/engine/rhyming/codec.mjs` | One world, many views | `diffDelta` / `mergeDelta` / working sets | In-process | FractiSI | **Baseline** | Keep | — | Proven density | Existing benches | — | Preserve |
| JEPA masked latent prediction | V-JEPA 2 | arXiv 2506.09985 · `facebookresearch/vjepa2` | Predict missing latent structure without pixels | JEPA loss + EMA target encoder | GPU (ViT-L→G) | MIT / Apache-2.0 weights | Selective reconstruct | Predict unregistered deltas in latent form | Med | High for compact exchange | Lab on shared-state keys | **B/C** | Adapt idea; rebuild on FractiSI state |
| Dense predictive + deep SSL | V-JEPA 2.1 | arXiv 2603.14482 | Stronger dense features | Multi-layer SSL | GPU | MIT/Apache | None | Better predictive features if encoder added later | High | Uncertain for repo agents | Hold | **E** | Research further |
| Action-conditioned latent WM + CEM–MPC | V-JEPA 2-AC | same family | Zero-shot robot planning | Block-causal predictor; CEM energy to goal | GPU | MIT/Apache | Composition “what if” | Plan toward goal world embedding | Med | High for futures | Prototype `planWithCem` | **C** | Rebuild in FractiSI |
| RSSM + imagination RL | DreamerV3 | arXiv 2301.04104 · `danijar/dreamerv3` | Model-based policy in latent dreams | RSSM; imag_length rollouts | Single GPU | MIT | None | Alternative futures without env | Med | High for Part V loop | Prototype `createLatentDynamics` | **C** | Rebuild |
| Action embedder into DiT time | Cosmos Predict | cosmos-predict2 docs | Condition video on robot actions | MLP → timestamp emb | High VRAM | Apache code; NVIDIA/OpenMDW weights | proposeChange actions | Only if visual sidecar | High | Low for core MA | Skip core | **D** | Optional-external |
| Frame-replacement temporal context | Cosmos Predict2.5 | arXiv 2511.00062 | Variable history frames | Token frame replace | High VRAM | same | History buffer | Temporal continuity patterns | Med | Med | E3 temporal lab | **B** | Adapt concept to state history |
| World critic / Reasoner | Cosmos Reason | arXiv 2503.15558 | Embodied CoT / curation | 7B VLM critic | ≥24GB | Apache/OpenMDW | Deploy validation | Audit proposed futures | High | Med | Later | **D** | Optional-external |
| Director–Pilot dual agents | LingBot-World v2 paper | arXiv 2607.07534 | Semantic + physical co-sim | VLM director + DiT pilot | Multi-GPU | **CC BY-NC-SA-4.0** | Coordination seats | Role split | Low (concept) | Med | Rebuild seats | **C / F** | Rebuild pattern; **reject v2 weights** |
| Causal KV / sink attention | LingBot v1/v2 | repos | Long interactive video | local_attn_size, sink_size | Multi-GPU | v1 Apache / v2 NC | Context hooks | Long-horizon agent context | High | Uncertain | E | **E** | Research further |
| EDM few-step world dynamics | DIAMOND | arXiv 2405.12399 | Dream env for RL | EDM score WM | ~12GB | MIT | Imagination channel | High-fidelity optional dream | High | Low for core | Skip now | **B** | Adapt later if needed |
| Latent Action Model (VQ) | Jafar / Genie | arXiv 2402.15391 · FLAIROx/jafar | Unsupervised actions from video | VQ codebook + MaskGIT | Single L40S class | Apache-2.0 | session deltas | Compress unlabeled diffs to action codes | Med | Med–High | Next experiment | **B** | Adapt |
| Pixel reconstruction objective | Many video WMs | — | Visual fidelity | Decoder to pixels | High | varies | Explicitly avoided | Would explode Tiny Footprint | — | Negative | — | **F** | Reject for Layer A |
| Wrap full WFM as product core | Cosmos / LingBot | — | End-to-end world sim | Full stack | Extreme | varies | Would replace FractiSI | Vendor lock + wrong product | Extreme | Negative | — | **F** | Reject |

## Layer mapping

| FractiSI surface | Techniques that reinforce it |
|---|---|
| Tiny Footprint / Gateway | JEPA-style selective latent predict; reject pixel reconstruct; keep codec |
| Coordination | Director/Pilot role split; CEM planning of who acts |
| Shared state | Authoritative vs predicted categories; temporal history |
| Composition | Imagination rollouts before integrate; conflict as incompatible futures |
| Git awareness | Worktree ≈ isolated candidate future on disk |
| Deploy | Critic/approval remains human gate; never auto-commit predictions |

## Summary decisions

- **Adopt:** nothing as a hard runtime dependency.  
- **Adapt:** JEPA selective prediction, temporal frame-context idea, latent actions, EDM later.  
- **Build ourselves:** RSSM-lite + CEM planning + Predictive Shared World loop (done as prototype).  
- **Optional-external:** Cosmos / visual WFMs.  
- **Reject:** NC-licensed LingBot v2 core; pixel WFM as Layer A; wrapping WFMs as the product.
