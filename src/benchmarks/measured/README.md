# Measured tier

Live heap, resident set and materialization latency, each in its own process.

## Contents

| Path | What it is |
|---|---|
| [`child-runner.mjs`](child-runner.mjs) | Every measurement runs in its own child process: isolated JIT and heap state, and a process is the independent unit that the bootstrap resamples. |
| [`heap-measure.mjs`](heap-measure.mjs) | One heap measurement, in the process running it: wire text is prepared first and retained throughout, the store is built, and the heap is read after forced full collections on both sides. |
| [`heap.mjs`](heap.mjs) | Design of the heap benchmark: workloads x conditions x session counts x trials. |
| [`latency-measure.mjs`](latency-measure.mjs) | Materialization latency, in the process running it: the time to turn one stored session back into its full request text. |
| [`latency.mjs`](latency.mjs) | Design of the latency benchmark: workloads x conditions x independent processes. |
| [`rss-measure.mjs`](rss-measure.mjs) | Resident set size, in the process running it: what the operating system sees. |
| [`rss.mjs`](rss.mjs) | Design of the RSS benchmark. |
| [`session-stores.mjs`](session-stores.mjs) | The session stores compared by the measured benchmarks. |
