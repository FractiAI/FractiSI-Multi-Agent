# Riemann FractiSI expedition

## Engine-prompt invent (measured)

| Metric | Value |
|---|---|
| Wall clock | **43.63 s** |
| Engine prompt | `fractisi.tiny-footprint.infinite-octave.invent.v1` |
| Injections | **17** |
| Closed | **0 / 17** |
| Groq ok | **4 / 17** |
| Prior status-dump awareness | 29.94 s · 0/17 |
| Prior no-awareness | 46.53 s · 0/17 |

```bash
export GROQ_API_KEY=…  # never commit
cd lean && node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
