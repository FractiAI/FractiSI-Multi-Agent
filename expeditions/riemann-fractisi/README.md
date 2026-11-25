# Riemann FractiSI expedition

## Awareness-injected LLM invent (measured)

| Metric | Value |
|---|---|
| Wall clock | **29.94 s** (2 rounds) |
| Awareness injections | **17** |
| Closed | **0 / 17** |
| Groq calls / ok | **17 / 13** |
| Prior no-awareness | 46.53 s · 0/17 |
| Sealed Anthropic corpus | no |

```bash
export GROQ_API_KEY=…  # never commit
cd lean && node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
