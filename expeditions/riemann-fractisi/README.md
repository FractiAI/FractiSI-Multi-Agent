# Riemann FractiSI expedition

## FractiSI + LLM invent (measured)

| Metric | Value |
|---|---|
| Wall clock | **46.53 s** (2 rounds) |
| Closed | **0 / 17** |
| Groq calls / ok | **17 / 15** |
| Sealed Anthropic corpus | no |
| Anthropic baseline | ~1.5 days · ~60 LLM agents |

```bash
export GROQ_API_KEY=…  # never commit
cd lean && node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
