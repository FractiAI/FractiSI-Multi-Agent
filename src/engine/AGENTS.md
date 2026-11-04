# Engine

This is the only copy of the engine. Its behaviour is pinned byte for byte by `tests/fixtures/golden-experiments-0dcf9d2.json`, so a change that alters results needs a deliberate golden update. Measured latency is dominated by `structuredClone` in the codec.
