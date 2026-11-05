# Engine

This is the only copy of the engine. Its behaviour is pinned byte for byte by `tests/fixtures/golden-experiments-733b48e.json`, so a change that alters results needs a deliberate golden update. Measured latency was dominated by `structuredClone` in the codec; `mergeDelta` / `reconstructExpression` accept `{ clone: false }` for read/serialize paths. Keep `clone: true` (default) when the caller may mutate the result.
