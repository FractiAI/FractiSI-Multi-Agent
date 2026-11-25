# Riemann FractiSI expedition

## Matched invent (Player 1)

Challenge-only ζ invent — **no** sealed Anthropic corpus.

| Arm | Cutoff | Wall clock | Closed |
|---|---|---|---|
| FractiSI invent | **none** | **30.20 s** plateau | **0 / 17** |
| No-FractiSI invent | **180 s** | **34.12 s** plateau | **0 / 17** |
| Anthropic baseline | ~1.5 days | invent+formalize | green |

RH **OPEN**. No LLM keys on this VM.

```bash
cd lean
node timing/run-zeta23-invent.mjs --no-cutoff
node timing/run-zeta23-invent-no-kit.mjs --cutoff-seconds 180
```
