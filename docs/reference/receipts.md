# Receipt formats

A receipt is a JSON file recording what one stage produced. Keys are sorted and output is stable, so a diff shows real changes.

| Receipt | Tier | Stable across runs? | Binds |
|---|---|---|---|
| `output/data/deterministic/results.json` | Deterministic | Yes | Plan hash, source fingerprint |
| `output/data/deterministic/compression.json` | Deterministic | Same zlib only | zlib version |
| `output/data/simulation/h100_prefix_cache_sim.json` | Simulated | Yes | Nothing external |
| `output/data/suite/manifest.json` | Measured | No | Verdict on this host |
| `output/data/measured/heap.json` | Measured | No | Plan hash, source fingerprint, host, load |
| `output/data/measured/latency.json` | Measured | No | Plan hash, source fingerprint, host, load |
| `output/data/measured/rss.json` | Measured | No | Plan hash, source fingerprint, host, load |
| `output/data/measured/gpu_live.json` | Measured | No | Plan hash, source fingerprint, this run's lab outcome |
| `output/data/measured/llm/<model>-<backend>.json` | Measured | No | Plan hash, lab source fingerprint, model revision, software versions, seed |
| `output/data/analysis_summary.json` | Derived | Given the same receipts | Hash of each receipt |
| `output/data/manuscript_catalog.json` | Derived | Given the same summary | Each token's source path |
| `output/manuscript/hydration_manifest.json` | Derived | Given the same inputs | Hash of each section, summary and registry |
| `output/data/formalism_claim_ledger.json` | Derived | Given the same sections | Each formal statement and the file defining it |
| `output/figures/figure_registry.json` | Derived | Same platform and Matplotlib | Each image's hash and the summary's hash |
| `output/data/render_receipt.json` | Derived | Same template and toolchain | PDF hash, manifest hash, template commit |
| `output/reports/rendered_provenance.json` | Derived | Same template and toolchain | Hashes of tracked source, configuration, stage code and output |

## Lab outcomes

Every lab receipt has `status`, one of `pass`, `fail` or `not_run`.

```json
{ "ok": false, "status": "not_run", "liveRun": false, "reason": "nvcuda_unavailable", "detail": "…" }
```

| `reason` | Meaning |
|---|---|
| `python_unavailable` | The interpreter was not found |
| `nvcuda_unavailable` | The NVIDIA runtime is not on this host |
| `cuda_init_failed`, `cuda_device_unavailable` | The runtime is present and no usable device was found |
| `llm_stack_unavailable` | PyTorch or Transformers is not installed |
| `no_llm_environment` | No environment was found for the real-model lab |
| `not_requested` | The real-model lab was not asked to run |

## Historical receipts

`research/synthobs-tiny-gateway-rhyming-templates/data/` holds the receipts recorded on the original laptop, in their original format. They predate `status`, and analysis reads them through `src/analysis/historical.mjs`.
