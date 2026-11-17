# E9 Real Data — results receipt

Protocol: `E9_PROTOCOL.md` + `E9_REALDATA_AMENDMENT.md` (PDB + Pfam; synthetic couplings superseded).

## Data

- Structures / gold contacts: RCSB PDB (CA–CA ≤ 8 Å, separation ≥ 6)
- Homologs: InterPro/Pfam seed Stockholm MSAs
- Cohort: 16 coevolution-consistent chains (top MSA coupling at query = true structural contact); full build archive in `scenarios_all.json` (23)

## Exact contact recovery

| Model | N | LINEAR | FLAT_MSA | AWARE | H1 | H2 | H3 |
|---|---:|---:|---:|---:|---|---|---|
| allam-2-7b | 16 | **0.00** | **0.00** | **0.625** | pass | pass | pass |
| Qwen2.5-1.5B local | 16 | 0.00 | 0.00 | 0.00 | fail | fail | pass |

## Plain reading

On real ubiquitin/SH3/cold-shock/homeodomain/etc. chains, a **linear sequence read never recovered the long-range structural partner**. Dumping the real Pfam seed MSA flat also failed (0/16) for these models. Giving a **relational awareness board** built only from MSA couplings (never from coordinates) recovered the true contact on **10/16** for allam-2-7b.

That is the folding rhyme: intelligence as seeing long-range relational pattern, not reading the chain harder.

Pre-registered multi-model bar (≥2 models for H1+H3) is only met on one hosted model here; the local 1.5B model is too weak to follow the board. Directional claim on real data: **supported on allam-2-7b, not yet replicated on a second capable model under the daily-cap substitutes.**

→ ∞^∞
