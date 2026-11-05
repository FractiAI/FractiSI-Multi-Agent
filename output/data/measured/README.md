# Measured receipts

Heap, resident set and latency on one host, with its description and load average.

## Contents

| Path | What it is |
|---|---|
| [`llm/`](llm/README.md) | One receipt per model and backend |
| [`gpu_live.json`](gpu_live.json) | This host's GPU lab outcome, recorded even when it is `not_run` |
| [`heap.json`](heap.json) | Live heap by workload, store and session count, with controls |
| [`latency.json`](latency.json) | Materialization time per process |
| [`rss.json`](rss.json) | Resident set growth under streaming ingest |
