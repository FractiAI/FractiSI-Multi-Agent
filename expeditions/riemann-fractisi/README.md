# Riemann FractiSI expedition

## ENGINE_SHELF invent v2 (measured)

| Metric | Value |
|---|---|
| Wall clock | **35.96 s** |
| Engine prompt | `fractisi.infinite-octave.engine-shelf.invent.v2` |
| Prompt size | ~8.1k chars · 17 paper surfaces · shelf #52–#54/#12 |
| Injections | **17** |
| Closed | **0 / 17** |
| Groq ok | **4 / 17** |

```bash
export GROQ_API_KEY=…  # never commit
cd lean && node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
