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

Folding-rhyme **relational awareness** beats linear (and flat dump) on **protein**, **knowledge**, and **macroeconomy** — i.e. not only folds. That is evidence the pattern helps **higher systems** that agents operate in (multi-hop knowledge; macro coupling), which is the smarter-agent claim’s system-generalization step.

Honesty: AWARE often succeeds by using an explicit leading relational candidate derived from real couplings (MSA overlap / FRED lag-corr / Pfam). LINEAR never gets that map. This demonstrates **new ability vs linear under a shared world model**, not that the base model invented couplings from nothing.

→ ∞^∞
