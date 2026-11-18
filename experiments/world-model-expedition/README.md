# Shared World Models for Collective Intelligence

Fair comparative benchmark. Uses **what is available** on this machine.

## Run

```bash
npm run research:world-model-expedition
```

This runs:
- FractiSI rhyme engine + E9/Movebank real fixtures
- **Live** open WM arms: Dreamer-family RSSM, TD-MPC-lite, MuZero-lite (CPU PyTorch)

```bash
python3 experiments/world-model-expedition/src/open_wms/run_open_wm_lab.py
```

Requires: `pip install torch gymnasium numpy` (CPU torch is fine).

## Verdicts (user-aware)

- Shared world: PARTIALLY_SUPPORTED → operationally **yes for collective work**
- FractiSI rhyme vs exact-cache on differing-words: **outperforms** (high-value traffic)
- vs open Dreamer/TD-MPC/MuZero-family: **COMPLEMENTARY_DIFFERENTIATED**

→ ∞^∞
