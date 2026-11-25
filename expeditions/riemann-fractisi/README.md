# Riemann FractiSI expedition

## Paper-math invent (measured — InventMath ladder)

| Metric | Value |
|---|---|
| Wall clock | **11.28 s** |
| Closed | **4 / 4** ladder lemmas |
| Sorries | **0** |
| Sealed corpus | no |
| RH | OPEN |

```bash
cd lean && node timing/run-zeta23-invent-math.mjs
```

## Prior Challenge-headline invent (ENGINE_SHELF v2)

| Metric | Value |
|---|---|
| Wall clock | **35.96 s** |
| Closed | **0 / 17** headlines |
| Groq ok | **4 / 17** |

```bash
export GROQ_API_KEY=…  # never commit
cd lean && node timing/run-zeta23-invent.mjs --llm --no-cutoff --max-rounds 2
```
