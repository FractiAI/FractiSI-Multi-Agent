# Results {#sec:results}

## The published byte results reproduce exactly {#sec:res_bytes}

*Tier: deterministic.* All workload reductions match the historical receipt to every digit, and the aggregate reproduces at 84.5%. The values are in [@tbl:workloads] and [@fig:workload_reductions]. Full round trips hold for every record in the lossless workloads. Workload E is different in kind: its working set contains 4 of 768 vectors, so its 99.5% reduction is the size of one request's closure compared with the whole lattice, and it cannot reconstruct the rest.

| Workload | Conventional bytes | Tiny bytes | Reduction | gzip | Round trip |
| ---------------------------- | -------------: | ----------: | ---------: | -------: | ----------------------------- |
| B: Structured records | 76,020 | 34,715 | 54.3% | 95.7% | 500 of 500 exact |
| C: Cross-linked graph | 1,243,896 | 219,447 | 82.4% | 78.5% | 600 of 600 exact |
| D: Eight-node broadcast | 44,617 | 6,061 | 86.4% | 93.3% | 8 of 8 exact |
| E: Selective working set | 780,653 | 4,050 | 99.5% | n/a | not lossless: holds 4 of 768 |
| F: Shared system prompt | 191,496 | 97,816 | 48.9% | 90.4% | 40 of 40 exact |

: Representation bytes per workload, with gzip of the conventional JSON as a yardstick and full round-trip results. {#tbl:workloads}

![Representation-byte reduction for each registered workload, computed as one minus the Tiny Footprint form's UTF-8 JSON bytes over the conventional arm's. Diamonds show gzip applied to the same conventional JSON (zlib 1.2.12). Workload E is hatched because its working set covers one request and is not a lossless representation. These are serialized sizes, not resident memory.](../../output/figures/workload_reductions.png){#fig:workload_reductions width=92%}

gzip exceeds the template reduction on three of four lossless workloads. The redundancy is real, and general-purpose compression also finds it, at the cost of not being usable in place.

## The aggregate depends on selection and weighting {#sec:res_sensitivity}

*Tier: deterministic.* Workloads C and E together supply 86.6% of the baseline bytes, so by [@eq:aggregate] they dominate the aggregate. The alternatives in [@fig:aggregate_sensitivity] recompute it. Equal weighting gives 74.3%. Removing E, which is not lossless, gives 77.0%. Removing C's anti-pattern baseline as well gives 55.6%. The 80% gate is cleared under the published weighting and under four of five leave-one-out variants; the variant below it leaves out E.

![The aggregate reduction under alternative selections and weightings of the same five workloads. The published aggregate sums bytes, so each workload counts in proportion to its baseline size. Hollow markers fall below the target. All values are deterministic.](../../output/figures/aggregate_sensitivity.png){#fig:aggregate_sensitivity width=92%}

Workload C's baseline deserves separate attention. Moving from embedded node copies to edges that refer to nodes by id, with no template engine, saves 83.7%. Against that normalized graph, the Tiny form is 7.9% larger, because each edge carries a template reference and an index. In this workload the saving comes from normalization.

## Saving is bounded by the shared fraction {#sec:res_scaling}

*Tier: deterministic.* The test of [@prop:saturation] on the real encoding is in [@fig:session_scaling]. Measured reductions track the closed form within 3.0 points at every grid position, the gap coming from a small fixed overhead visible at low session counts. The ceiling is the practical result: at 125 turns per session the reduction saturates near 16.5% regardless of how many sessions share the prompt, against 94.3% at one turn.

![Reduction in JSON bytes as the number of sessions sharing one system prompt grows, for four conversation lengths. Markers are measured on the real encoding; dashed lines are the closed form $R(n) = f(1 - 1/n)$, where $f$ is the shared fraction. The reduction saturates at $f$, and $f$ falls as sessions accumulate turns.](../../output/figures/session_scaling.png){#fig:session_scaling width=92%}

## The exact cache overtakes the rhyme as duplicates grow {#sec:res_crossover}

*Tier: deterministic.* With 40 same-shaped sessions and different words, the rhyme stores 4,758 bytes against 6,704 for an exact-text cache, 29.0% less. When all sessions repeat the same words, the cache stores 164 bytes and the rhyme 4,691. The sweep in [@fig:rhyme_crossover] fills in between: the cache is already smaller at 40% duplicates on the tested grid. Reconstruction matched at every point.

![JSON bytes for 40 same-shaped sessions as a growing share of them repeat one identical record. The rhyme stays nearly flat because it records every session; the exact-text cache improves with every duplicate. Reconstruction matched the original at every point. In-process bytes, not device memory.](../../output/figures/rhyme_crossover.png){#fig:rhyme_crossover width=92%}

## The instrument reads what is allocated {#sec:res_controls}

*Tier: measured.* The empty control read 144 bytes across 21 processes, with a maximum of 144. The known control read 1,600,192 bytes against 1,600,000 expected, an error of 0.01%. In 56 of 56 cells of the design, every process read the same number, so heap intervals are narrow or empty. A narrow interval shows that a reading repeats, and a systematic error would repeat as well. That is why the controls, and a check that total heap grows with store size, carry the weight here.

## JSON bytes overstate live memory {#sec:res_heap}

*Tier: measured.* The comparison of what JSON predicts with what the heap shows at 1,024 sessions is in [@fig:heap_vs_json] and [@tbl:heap]. With a shared system prompt, JSON predicts a reduction of 49.5% and the heap falls 32.8%, because in a live heap each session's turns carry object overhead that serialized text does not. A plain object reference reaches 32.9%, with JSON unable to see any saving from it at all. Over this workload the template engine and an ordinary reference hold the same memory, within 0.04% of each other.

![Reduction relative to the duplicated store at 1,024 sessions: what serialized JSON predicts (open) and what a forced-collection read of the V8 heap shows (filled, median with percentile-bootstrap 95% interval over independent processes). Negative values mean a larger heap than the duplicated store.](../../output/figures/heap_vs_json.png){#fig:heap_vs_json width=92%}

With the same shape and different words, which is the case rhyming exists for, the gap is larger. JSON predicts 31.9% and the heap shows 10.3%. V8's hidden classes already share the repeated keys, and the engine adds a wrapper object and a delta object per session. Removing that wrapper changes the picture: the compact ablation reaches 30.4%, past the aliased store at 24.1%, because each session then holds only the fields that differ. The idea can beat a plain reference in a live heap, and the shipped encoding is what prevents it. The exact-text cache is 54.5% larger than duplication here, because it has no hits and keeps a digest per session. When sessions are truly identical it is the smallest store, at 95.2%.

| Workload | Store | JSON bytes | Heap | JSON reduction | Heap reduction |
| ---------------- | -------------------- | -----------: | -----------: | -------------------: | -------------------: |
| Shared prompt | Aliased | 4847.2 KiB | 5107.4 KiB | 0.0% | 32.9% |
| Shared prompt | Tiny (shipped) | 2445.7 KiB | 5109.4 KiB | 49.5% | 32.8% |
| Shared prompt | Duplicated | 4847.2 KiB | 7608.9 KiB | 0.0% | 0.0% |
| Shared prompt | Exact-text cache | 4914.3 KiB | 7740.7 KiB | -1.4% | -1.7% |
| Same shape | Tiny compact | 77.0 KiB | 138.6 KiB | 54.4% | 30.4% |
| Same shape | Aliased | 168.8 KiB | 151.1 KiB | 0.0% | 24.1% |
| Same shape | Tiny (shipped) | 115.0 KiB | 178.6 KiB | 31.9% | 10.3% |
| Same shape | Duplicated | 168.8 KiB | 199.0 KiB | 0.0% | 0.0% |
| Same shape | Exact-text cache | 235.8 KiB | 307.5 KiB | -39.7% | -54.5% |
| Identical | Exact-text cache | 67.2 KiB | 9.3 KiB | 58.8% | 95.2% |
| Identical | Aliased | 163.0 KiB | 80.6 KiB | 0.0% | 58.1% |
| Identical | Tiny compact | 74.2 KiB | 131.4 KiB | 54.5% | 31.7% |
| Identical | Tiny (shipped) | 112.2 KiB | 171.4 KiB | 31.2% | 11.0% |
| Identical | Duplicated | 163.0 KiB | 192.5 KiB | 0.0% | 0.0% |

: Representation size and live heap by store at the largest session count, with reductions relative to the duplicated store. {#tbl:heap}

The same designs across session counts are in [@fig:heap_scaling]. Small stores carry visible fixed overhead, which is why the shipped engine uses more heap than duplication at 16 sessions in the same-shape workload, at 429 against 224 bytes per session. It first uses less at 256 sessions on the tested grid.

![Median V8 heap per session against the number of sessions, for each store design and workload. Panels use independent vertical scales, because the workloads differ in record size by more than an order of magnitude. The measuring host is reported in the Methods section.](../../output/figures/heap_scaling.png){#fig:heap_scaling width=92%}

## Resident memory falls less than the heap {#sec:res_rss}

*Tier: measured.* What the operating system sees moves in the same direction as the heap, by less. At 16,384 sessions with a shared prompt, [@tbl:rss] shows RSS growing by 199.5 MiB for the duplicated store and 157.6 MiB for Tiny, a reduction of 21.0% against 32.1% in the heap. Resident pages also hold allocator slack and recently collected garbage, which a heap reading excludes. The aliased store again matches Tiny, at 21.2%. Peak RSS over ingestion is 307.4 MiB and 268.9 MiB respectively.

| Store | RSS growth | 95% interval | RSS reduction | Heap reduction |
| ------------------- | ------------: | --------------------------- | -------------------: | -------------------: |
| Duplicated | 199.5 MiB | 196.5 MiB to 199.9 MiB | 0.0% | 0.0% |
| Tiny (shipped) | 157.6 MiB | 157.3 MiB to 157.8 MiB | 21.0% | 32.1% |
| Aliased | 157.1 MiB | 157.0 MiB to 157.4 MiB | 21.2% | 32.1% |

: Resident set growth while ingesting 16,384 sessions, with percentile-bootstrap intervals over processes. {#tbl:rss}

## Materialization is slower, mostly because of one call {#sec:res_latency}

*Tier: measured.* Reconstructing a session costs time that reading it does not. As [@fig:materialization_latency] and [@tbl:latency] show, the shipped engine takes 1.81× the duplicated store's time with a shared prompt and 11.44× with the same shape and different words. Nearly all of that is `structuredClone`. Without it the ratios are 1.04× and 1.24×. Every condition reproduced the original text in 7,680 of 7,680 checks. The in-process path therefore provides no latency gain, and a removable implementation choice accounts for most of its cost.

![Time to turn one stored session back into its full request text, with each store's ratio to the duplicated store. Points are medians over independent processes, with percentile-bootstrap 95% intervals. Every condition reproduced the original text exactly. With a shared prompt, removing `structuredClone` from reconstruction moves the ratio from 1.81 to 1.04.](../../output/figures/materialization_latency.png){#fig:materialization_latency width=92%}

| Workload | Store | Median | 95% interval | Ratio | 95% interval |
| ---------------- | -------------------- | ---------: | -------------------- | --------: | ----------------- |
| Shared prompt | Aliased | 1.90 µs | 1.80 µs to 1.93 µs | 0.99× | 0.95× to 1.01× |
| Shared prompt | Duplicated | 1.92 µs | 1.85 µs to 1.94 µs | 1.00× | 0.98× to 1.03× |
| Shared prompt | Tiny without clone | 1.99 µs | 1.96 µs to 2.01 µs | 1.04× | 1.02× to 1.07× |
| Shared prompt | Tiny (shipped) | 3.47 µs | 3.45 µs to 3.48 µs | 1.81× | 1.79× to 1.87× |
| Same shape | Aliased | 0.12 µs | 0.12 µs to 0.13 µs | 0.98× | 0.98× to 1.02× |
| Same shape | Duplicated | 0.13 µs | 0.12 µs to 0.13 µs | 1.00× | 0.98× to 1.02× |
| Same shape | Tiny without clone | 0.15 µs | 0.15 µs to 0.16 µs | 1.24× | 1.23× to 1.28× |
| Same shape | Tiny (shipped) | 1.43 µs | 1.41 µs to 1.44 µs | 11.44× | 11.29× to 11.79× |

: Time to materialize one session from each store, as medians over independent processes, with the ratio to the duplicated store. {#tbl:latency}

## Real models: prefix reuse speeds prefill and only prefill {#sec:res_llm}

*Tier: measured.* Reusing a shared prefix skips computation, so unlike in-process reconstruction it does save time. Prefill speedups are 1.38× to 3.43× per turn ([@fig:llm_prefill] and [@tbl:llm]). Decode alone is essentially unaffected, at 0.99× to 1.02×, because after prefill both arms hold the same cache and do the same work per token. Over prefill and decode together, including the once-per-trial cost of the shared prefix, the speedup is 1.07× to 1.56×.

![Real forward passes: prefill time per turn when the whole prompt is processed again, and when a shared prefix's key-value tensors are reused so only the session's own tokens are processed. Labels give the speedup. Points are medians of per-trial medians, and their intervals describe repeatability within one process. Reusing a prefix is what a production prefix cache already does, so this compares against a baseline without one.](../../output/figures/llm_prefill.png){#fig:llm_prefill width=92%}

| Model | Backend | Re-prefill | Shared | Prefill | Decode | Both | Tokens equal | Control |
| ------------- | --------- | -----------: | ----------: | --------: | --------: | -------: | -------------: | ----------: |
| distilgpt2 | CPU | 51.64 ms | 15.05 ms | 3.43× | 0.99× | 1.56× | 16 of 16 | caught |
| distilgpt2 | MPS | 22.37 ms | 6.61 ms | 3.38× | 1.00× | 1.47× | 16 of 16 | caught |
| tiny-gpt2 | CPU | 1.95 ms | 0.69 ms | 2.82× | 1.00× | 1.26× | 16 of 16 | missed |
| tiny-gpt2 | MPS | 1.58 ms | 1.15 ms | 1.38× | 1.02× | 1.07× | 16 of 16 | missed |

: Real-model timing by model and backend. Re-prefill and shared give prefill time per turn without and with a shared prefix. Prefill is their ratio. Decode and both (prefill plus decode) are ratios of per-trial totals. Tokens equal counts turns whose greedy output matched exactly between arms, and control says whether the check caught a deliberately wrong cache. {#tbl:llm}

Output equivalence, which the original lab did not check, held: greedy tokens matched in 64 of 64 turns, with a worst last-position logit difference across runs of 1.4e-4 against a declared tolerance of 0.05. A control shows how far to trust that. Given a cache built from the wrong prefix, `distilgpt2`'s logits differ by at least 3.09, so the check fails, although its greedy tokens still match in 30 of 32 turns. Matching tokens alone therefore say little. On `tiny-gpt2` the check passes even then, at 1.9e-5, because that minimal model's logits barely depend on context. The evidence for equivalence is therefore the logit agreement on `distilgpt2`, within 1.4e-4.

The historical 1.17× training speedup does not reappear. In this design both arms perform the same forward, backward and optimizer steps per round, and with warm-up and interleaving the ratio is 0.98× to 1.02× over 15 rounds. The original lab ran one arm entirely before the other, with no warm-up, over five steps. That does not show the historical value was an artifact on its own hardware. It does mean no mechanism in the arms predicts a speedup, and none is seen here.

## Real models: KV residency matches the accounting {#sec:res_residency}

*Tier: measured.* The readings in [@fig:kv_residency] and [@tbl:residency] hold eight sessions of `distilgpt2` live on MPS. The summed tensor sizes equal [@eq:kv] exactly, and the device allocator agrees closely, at 84.4% against 84.1% predicted. This is the first device-memory reduction in this repository measured on a real model's tensors, and it supports the accounting behind the roofline below. Holding the prefix separately has a cost: rebuilding one session's full cache by concatenation takes 0.34 ms on this backend, and the rebuilt tensors match a full prefill to within 2.0e-5.

![Key-value cache held live for 8 sessions of distilbert/distilgpt2 on MPS: 512 shared prefix tokens and 21 tokens per session, by three accountings. Sharing the prefix is predicted to save 84.1%; summed tensor sizes give 84.1% and the device allocator 84.4%.](../../output/figures/kv_residency.png){#fig:kv_residency width=92%}

| Model | Backend | Predicted | Tensors | Allocator | Duplicated | Shared | + weights |
| ------------- | ---------- | -----------: | ----------: | -----------: | -------------: | -----------: | -----------: |
| distilgpt2 | CPU | 84.1% | 84.1% | n/a | 149.9 MiB | 23.9 MiB | 27.3% |
| distilgpt2 | MPS | 84.1% | 84.1% | 84.4% | 154.5 MiB | 24.2 MiB | 27.3% |
| tiny-gpt2 | CPU | 80.9% | 80.9% | n/a | 0.1 MiB | 0.0 MiB | 11.9% |
| tiny-gpt2 | MPS | 80.9% | 80.9% | 78.5% | 0.1 MiB | 0.0 MiB | 11.9% |

: KV residency. Predicted, tensors and allocator are reductions by three accountings. Duplicated and shared are bytes held, on the allocator where one exists and otherwise summed tensors. The last column is the reduction with weights counted, from [@eq:with_weights]. {#tbl:residency}

Counting weights changes the headline. With the 312.5 MiB of weights resident under both designs, the reduction for this run is 27.3%, as [@eq:with_weights] predicts. Residency also depends directly on the ratio of prefix to suffix, as [@prop:saturation] says, and a longer conversation means a smaller saving.

## Simulation at datacenter scale {#sec:res_h100}

*Tier: simulated.* On the NVIDIA H100 SXM 80GB profile the same accounting reduces KV by 88.2% and resident memory by 50.8% once weights are counted. The Tiny Footprint arm and the production prefix cache hold the same resident set, a difference of zero bytes, because no KV compression factor has been measured. Peak-bandwidth copy time is an upper bound. No H100 was involved.

## Historical GPU evidence {#sec:res_historical}

*Tier: historical, with an arithmetic check.* The 81.4% allocation reduction reproduces to every digit from the lab's requested buffer sizes, with no GPU, because that is all it is: 288 MiB against 53.6 MiB, computed from 16 sessions, four MiB of KV per session, a 12 MiB system buffer, and a hard-coded assumption that a session's delta is 15% of its KV buffer. The sweep in [@fig:gpu_proxy_sensitivity] shows how that assumption carries the result. The value falls below the 80% gate by a delta of 25%, and it is 62.5% if a session keeps its whole KV buffer. Nothing in this repository measures the delta.

![The GPU lab's allocation reduction recomputed from its requested buffer sizes, as a function of the assumed per-session delta. The open marker is the value hard-coded in the lab, which reproduces the published figure exactly and needs no GPU. No experiment in this repository measures that fraction.](../../output/figures/gpu_proxy_sensitivity.png){#fig:gpu_proxy_sensitivity width=92%}

The nvidia-smi peak, from 313 to 85 MiB, and the turn speedup, 11.24× and 9.60× in the two stored receipts, are device readings from that machine and could not be repeated here. The speedups are near the 9.41× ratio of bytes copied per turn, which is what a copy benchmark would be expected to show. The historical receipts do not establish a saving on a model forward. On that lab's real-model run the same nvidia-smi reading was 265 MiB in both arms.
