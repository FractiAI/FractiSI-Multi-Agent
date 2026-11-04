# CLI

```bash
node scripts/tiny.mjs <command>
```

| Command | Does | Sends anything? |
|---|---|---|
| `doctor` | Reports the kit, Node, Python and any NVIDIA GPU | No |
| `install` | Checks that the research suite is present and creates `benchmarks/reports/` | No |
| `demo` | Runs the multi-session reference workload and prints its JSON byte comparison | No |
| `benchmark [--full]` | Benchmarks this machine, writing receipts to `benchmarks/reports/` | No |
| `report [--share]` | Writes `customer-benchmark.html`. `--share` also sends results | Only with `--share` |
| `integrate` | Prints the versioned adapter list | No |
| `join` | Records your details and asks whether to share results | Contact details, plus results if you say yes |
| `share [--yes]` | Sends your latest results, after confirming unless `--yes` | Yes, after consent |

With no command, `doctor` runs. Exit status is 0 on success and 1 on failure. `benchmark` exits 0 when labs did not run, because that is not a failure: read its verdict.

## What a benchmark writes

| File | Holds |
|---|---|
| `empirical_report.json` | The suite's results, verdict and this host's description |
| `empirical_report.md` | The same, for reading |
| `heap_benchmark.json` | Live heap by store, with raw samples |
| `gpu_live_chat_hbm_lab.json` | This run's GPU lab outcome, which may be `not_run` |
| `gpu_llm_real_lab.json` | This run's real-model lab outcome, which may be `not_run` |
| `customer-benchmark.html` | Written by `report` |

The real-model lab runs only when requested, with `TINY_FOOTPRINT_FORCE_LLM_LAB=1` or `benchmark.forceLlmLab`, because it needs PyTorch and a model download. See [configuration](configuration.md).

## Consent

`join` and `share` are opt-in. Declining in `join` sends only contact details and hardware interest, and benchmark receipts are not read. A results packet holds your receipts, hostname, platform and Node version. It is written with owner-only permissions under the gitignored `benchmarks/reports/share-packets/`.

## Project scripts

These build the study rather than the customer report. See [`scripts/`](../../scripts/README.md).
