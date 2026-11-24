# Timing harness

Wall-clock wrapper for the Riemann FractiSI expedition.

## Run

```bash
# from docs/riemann-lean
node timing/run-expedition.mjs
./timing/run-expedition.sh --phase 0

# hook FractiSI kit CLI when available
node timing/run-expedition.mjs --tiny /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs

# dry-run harness only (no lake)
node timing/run-expedition.mjs --skip-lake
```

## Receipt

JSON under `../receipts/` (or `--receipt PATH`) with:

- `startedAt` / `endedAt` (ISO-8601 UTC)
- `durationSeconds`
- `leanGate.ok`
- `comparison` vs `--baseline-hours` (default **30**)
- `honesty` block (RH open; Anthropic URLs)
- `steps[]` command transcripts

Schema id: `fractisi.riemann-expedition.timing.v1`

## Kit hook points

When `--tiny` points at `scripts/tiny.mjs`:

1. `tiny init` — shared-world / platform state under this tree  
2. `tiny status`  
3. `tiny agents register` for roles: `lead`, `lemma-worker`, `referee`, `lean-builder`

Further composition / propose hooks can be added without changing the receipt schema (append to `steps`).
