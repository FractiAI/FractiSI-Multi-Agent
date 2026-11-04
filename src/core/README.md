# Core

Primitives with no knowledge of the product. Everything else may depend on these, and these depend only on each other and Node.

## Contents

| Path | What it is |
|---|---|
| [`bytes.mjs`](bytes.mjs) | Representation-size accounting. |
| [`canonical-json.mjs`](canonical-json.mjs) | Byte-stable JSON and content hashing for receipts. |
| [`config.mjs`](config.mjs) | Product configuration and package metadata, with documented defaults. |
| [`format.mjs`](format.mjs) | Presentation formats. |
| [`html.mjs`](html.mjs) | Escape a value for interpolation into generated HTML text or attributes. |
| [`index.mjs`](index.mjs) | Re-exports this folder's public API. |
| [`paths.mjs`](paths.mjs) | Canonical repository locations. |
| [`rng.mjs`](rng.mjs) | Seeded mulberry32 generator. |
| [`stats.mjs`](stats.mjs) | Dependency-free descriptive statistics used by the measured benchmarks. |
