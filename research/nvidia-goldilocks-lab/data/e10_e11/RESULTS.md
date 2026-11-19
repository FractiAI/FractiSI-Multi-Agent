# E10 + E11 — higher-system folding rhymes (results)

Protocol: `E10_E11_HIGHER_SYSTEM_RHYMES.md` (pre-registered). Protein E9 remains the biological baseline.

## Exact long-range pair recovery (rescored)

| Rhyme | System | Model | N | LINEAR | FLAT | AWARE | H1/H2/H3 |
|---|---|---|---:|---:|---:|---:|---|
| E9 | Protein (PDB+Pfam) | allam-2-7b | 16 | 0.00 | 0.00 | 0.625 | pass |
| E10 | Knowledge (HotpotQA bridge) | allam-2-7b | 24 | 0.125 | 0.167 | **0.792** | pass |
| E10 | Knowledge | Qwen2.5-1.5B | 24 | 0.042 | 0.083 | **0.875** | pass |
| E11 | Macro teleconnection (FRED) | allam-2-7b | 24 | 0.00 | 0.00 | **0.458** | pass |
| E11 | Macro teleconnection | Qwen2.5-1.5B | 24 | 0.00 | 0.00 | **1.00** | pass |

## Cross-rhyme verdict

**What was tested.** Same three arms on each rhyme: LINEAR (local sequence/passage/series text only), FLAT (same material without a structured map), AWARE (explicit board of measured long-range couplings). Scored outcome = exact recovery of one held-out long-range partner (PDB contact residue · HotpotQA supporting title pair · strongest FRED lagged series).

**What “beat linear” means here.** Under the same model and the same recovery question, AWARE’s exact-recovery rate was higher than LINEAR’s (and higher than FLAT’s) on all three rhymes above — not a preference rating, and not a claim that the base model invented the couplings. The board supplies a leading relational candidate from real MSA / passage-overlap / lag-correlation structure; LINEAR never sees that map.

**Why it matters.** The lift is not limited to protein folds. Multi-hop knowledge and macro coupling are systems agents actually use, so the same relational Rhyming World Model move generalizes beyond biology.

Honesty: AWARE often succeeds by using an explicit leading relational candidate derived from real couplings (MSA overlap / FRED lag-corr / Pfam). LINEAR never gets that map. This demonstrates **new ability vs linear under a shared world model**, not that the base model invented couplings from nothing.

→ ∞^∞
