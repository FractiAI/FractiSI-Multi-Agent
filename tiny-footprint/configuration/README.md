# Configuration

`default.json` is read by [`src/core/config.mjs`](../../src/core/config.mjs). Environment variables are documented in the [configuration reference](../../docs/reference/configuration.md).

| Key | Used for |
|-----|----------|
| `product` | CLI/report title and share-packet product name |
| `edition` | `doctor` output |
| `headline` | Generated benchmark report subtitle |
| `benchmark.suiteRelative` | Research suite path, resolved relative to this file. `doctor` and `install` check it |
| `benchmark.forceLlmLab` | Default for `TINY_FOOTPRINT_FORCE_LLM_LAB` when the env var is unset |
| `honesty.localGpuNotHbm` | Adds the local-GPU honesty line to generated reports |
| `honesty.notHostedFrontierBakeoff` | Adds the hosted-bake-off honesty line to generated reports |

The package version comes from the root `package.json`; do not duplicate it here.
