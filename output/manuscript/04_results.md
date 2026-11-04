# Results {#sec:results}

## The published byte results reproduce exactly {#sec:res_bytes}

*Tier: deterministic.* All workload reductions match the historical receipt to every digit, and the aggregate reproduces at 84.5%. The values are in [@tbl:workloads] and [@fig:workload_reductions]. Full round trips hold for every record in the lossless workloads. Workload E is different in kind: its working set contains 4 of 768 vectors, so its 99.5% reduction is the size of one request's closure compared with the whole lattice, and it cannot reconstruct the rest.

| Workload | Conventional bytes | Tiny bytes | Reduction | gzip | Round trip |
| ---------------------------- | -------------: | ----------: | ---------: | -------: | ----------------------------- |
| B: Structured records | 76,020 | 34,859 | 54.1% | 95.8% | 500 of 500 exact |
| C: Cross-linked graph | 1,243,896 | 219,496 | 82.4% | 78.5% | 600 of 600 exact |
| D: Eight-node broadcast | 44,617 | 6,061 | 86.4% | 93.3% | 8 of 8 exact |
| E: Selective working set | 780,653 | 4,050 | 99.5% | n/a | not lossless: holds 4 of 768 |
| F: Shared system prompt | 191,496 | 97,926 | 48.9% | 90.4% | 40 of 40 exact |

: Representation bytes per workload, with gzip of the conventional JSON as a yardstick and full round-trip results. {#tbl:workloads}

![Representation-byte reduction for each registered workload, computed as one minus the Tiny Footprint form's UTF-8 JSON bytes over the conventional arm's. Diamonds show gzip applied to the same conventional JSON (zlib 1.2.12). Workload E is hatched because its working set covers one request and is not a lossless representation. These are serialized sizes, not resident memory.](../../output/figures/workload_reductions.png){#fig:workload_reductions width=92%}

gzip exceeds the template reduction on three of four lossless workloads. The redundancy is real, and general-purpose compression also finds it, at the cost of not being usable in place.

## The aggregate depends on selection and weighting {#sec:res_sensitivity}

*Tier: deterministic.* Workloads C and E together supply 86.6% of the baseline bytes, so by [@eq:aggregate] they dominate the aggregate. The alternatives in [@fig:aggregate_sensitivity] recompute it. Equal weighting gives 74.3%. Removing E, which is not lossless, gives 77.0%. Removing C's anti-pattern baseline as well gives 55.5%. The 80% gate is cleared under the published weighting and under four of five leave-one-out variants; the variant below it leaves out E.

![The aggregate reduction under alternative selections and weightings of the same five workloads. The published aggregate sums bytes, so each workload counts in proportion to its baseline size. Hollow markers fall below the target. All values are deterministic.](../../output/figures/aggregate_sensitivity.png){#fig:aggregate_sensitivity width=92%}

Workload C's baseline deserves separate attention. Moving from embedded node copies to edges that refer to nodes by id, with no template engine, saves 83.7%. Against that normalized graph, the Tiny form is 8.0% larger, because each edge carries a template reference and an index. In this workload the saving comes from normalization.

## Saving is bounded by the shared fraction {#sec:res_scaling}

*Tier: deterministic.* The test of [@prop:saturation] on the real encoding is in [@fig:session_scaling]. Measured reductions track the closed form within 7.3 points at every grid position, the gap coming from a small fixed overhead visible at low session counts. The ceiling is the practical result: at 125 turns per session the reduction saturates near 16.5% regardless of how many sessions share the prompt, against 94.3% at one turn.

![Reduction in JSON bytes as the number of sessions sharing one system prompt grows, for four conversation lengths. Markers are measured on the real encoding; dashed lines are the closed form $R(n) = f(1 - 1/n)$, where $f$ is the shared fraction. The reduction saturates at $f$, and $f$ falls as sessions accumulate turns.](../../output/figures/session_scaling.png){#fig:session_scaling width=92%}

## The exact cache overtakes the rhyme as duplicates grow {#sec:res_crossover}

*Tier: deterministic.* With 40 same-shaped sessions and different words, the rhyme stores 5,554 bytes against 8,064 for an exact-text cache, 31.1% less. When all sessions repeat the same words, the cache stores 198 bytes and the rhyme 5,572. The sweep in [@fig:rhyme_crossover] fills in between: the cache is already smaller at 40% duplicates on the tested grid. Reconstruction matched at every point.

![JSON bytes for 40 same-shaped sessions as a growing share of them repeat one identical record. The rhyme stays nearly flat because it records every session; the exact-text cache improves with every duplicate. Reconstruction matched the original at every point. In-process bytes, not device memory.](../../output/figures/rhyme_crossover.png){#fig:rhyme_crossover width=92%}

## The instrument reads what is allocated {#sec:res_controls}

*Tier: measured.* The empty control read 144 bytes across 21 processes, with a maximum of 144. The known control read 1,600,192 bytes against 1,600,000 expected, an error of 0.01%. In 56 of 56 cells of the design, every process read the same number, so heap intervals are narrow or empty. A narrow interval shows that a reading repeats, and a systematic error would repeat as well. That is why the controls, and a check that total heap grows with store size, carry the weight here.

## JSON bytes overstate live memory {#sec:res_heap}

*Tier: measured.* The comparison of what JSON predicts with what the heap shows at 1,024 sessions is in [@fig:heap_vs_json] and [@tbl:heap]. With a shared system prompt, JSON predicts a reduction of 49.5% and the heap falls 32.8%, because in a live heap each session's turns carry object overhead that serialized text does not. A plain object reference reaches 32.9%, with JSON unable to see any saving from it at all. Over this workload the template engine and an ordinary reference hold the same memory, within 0.07% of each other.

![Reduction relative to the duplicated store at 1,024 sessions: what serialized JSON predicts (open) and what a forced-collection read of the V8 heap shows (filled, median with percentile-bootstrap 95% interval over independent processes). Negative values mean a larger heap than the duplicated store.](../../output/figures/heap_vs_json.png){#fig:heap_vs_json width=92%}

With the same shape and different words, which is the case rhyming exists for, the gap is larger. JSON predicts 35.9% and the heap shows 4.2%. V8's hidden classes already share the repeated keys, and the engine adds a wrapper object and nested delta objects per session. Removing the wrapper recovers most of the difference: the compact ablation reaches 20.9%, level with the aliased store at 20.1%, because each session then holds only the fields that differ. In a live heap the idea roughly matches a plain reference, and the shipped encoding gives that saving back. The exact-text cache is 45.4% larger than duplication here, because it has no hits and keeps a digest per session. When sessions are truly identical it is the smallest store, at 96.0%.

| Workload | Store | JSON bytes | Heap | JSON reduction | Heap reduction |
| ---------------- | -------------------- | -----------: | -----------: | -------------------: | -------------------: |
| Shared prompt | Aliased | 4847.2 KiB | 5107.4 KiB | 0.0% | 32.9% |
| Shared prompt | Tiny (shipped) | 2445.8 KiB | 5110.9 KiB | 49.5% | 32.8% |
| Shared prompt | Duplicated | 4847.2 KiB | 7608.9 KiB | 0.0% | 0.0% |
| Shared prompt | Exact-text cache | 4914.3 KiB | 7740.7 KiB | -1.4% | -1.7% |
| Same shape | Tiny compact | 92.0 KiB | 189.1 KiB | 54.6% | 20.9% |
| Same shape | Aliased | 202.8 KiB | 191.1 KiB | 0.0% | 20.1% |
| Same shape | Tiny (shipped) | 130.0 KiB | 229.1 KiB | 35.9% | 4.2% |
| Same shape | Duplicated | 202.8 KiB | 239.0 KiB | 0.0% | 0.0% |
| Same shape | Exact-text cache | 269.8 KiB | 347.5 KiB | -33.0% | -45.4% |
| Identical | Exact-text cache | 67.2 KiB | 9.4 KiB | 65.9% | 96.0% |
| Identical | Aliased | 197.0 KiB | 72.7 KiB | 0.0% | 68.8% |
| Identical | Tiny compact | 91.4 KiB | 189.2 KiB | 53.6% | 18.6% |
| Identical | Tiny (shipped) | 129.4 KiB | 229.2 KiB | 34.3% | 1.4% |
| Identical | Duplicated | 197.0 KiB | 232.5 KiB | 0.0% | 0.0% |

: Representation size and live heap by store at the largest session count, with reductions relative to the duplicated store. {#tbl:heap}

The same designs across session counts are in [@fig:heap_scaling]. Small stores carry visible fixed overhead, which is why the shipped engine uses more heap than duplication at 16 sessions in the same-shape workload, at 579 against 264 bytes per session. It first uses less at 1,024 sessions on the tested grid.

![Median V8 heap per session against the number of sessions, for each store design and workload. Panels use independent vertical scales, because the workloads differ in record size by more than an order of magnitude. The measuring host is reported in the Methods section.](../../output/figures/heap_scaling.png){#fig:heap_scaling width=92%}

## Resident memory falls less than the heap {#sec:res_rss}

*Tier: measured.* What the operating system sees moves in the same direction as the heap, by less. At 16,384 sessions with a shared prompt, [@tbl:rss] shows RSS growing by 196.1 MiB for the duplicated store and 157.4 MiB for Tiny, a reduction of 19.7% against 32.1% in the heap. Resident pages also hold allocator slack and recently collected garbage, which a heap reading excludes. The aliased store again matches Tiny, at 20.1%. Peak RSS over ingestion is 304.1 MiB and 269.2 MiB respectively.

| Store | RSS growth | 95% interval | RSS reduction | Heap reduction |
| ------------------- | ------------: | --------------------------- | -------------------: | -------------------: |
| Duplicated | 196.1 MiB | 194.4 MiB to 199.7 MiB | 0.0% | 0.0% |
| Tiny (shipped) | 157.4 MiB | 157.2 MiB to 157.7 MiB | 19.7% | 32.1% |
| Aliased | 156.6 MiB | 156.5 MiB to 157.0 MiB | 20.1% | 32.1% |

: Resident set growth while ingesting 16,384 sessions, with percentile-bootstrap intervals over processes. {#tbl:rss}

## Materialization is slower, mostly because of one call {#sec:res_latency}

*Tier: measured.* Reconstructing a session costs time that reading it does not. As [@fig:materialization_latency] and [@tbl:latency] show, the shipped engine takes 1.69× the duplicated store's time with a shared prompt and 11.81× with the same shape and different words. Most of that is `structuredClone`. Without it the ratios are 1.06× and 1.96×. Every condition reproduced the original text in 7,680 of 7,680 checks. The in-process path therefore provides no latency gain, and a removable implementation choice accounts for most of its cost.

![Time to turn one stored session back into its full request text, with each store's ratio to the duplicated store. Points are medians over independent processes, with percentile-bootstrap 95% intervals. Every condition reproduced the original text exactly. With a shared prompt, removing `structuredClone` from reconstruction moves the ratio from 1.69 to 1.06.](../../output/figures/materialization_latency.png){#fig:materialization_latency width=92%}

| Workload | Store | Median | 95% interval | Ratio | 95% interval |
| ---------------- | -------------------- | ---------: | -------------------- | --------: | ----------------- |
| Shared prompt | Aliased | 1.89 µs | 1.88 µs to 1.90 µs | 1.00× | 0.97× to 1.07× |
| Shared prompt | Duplicated | 1.90 µs | 1.76 µs to 1.94 µs | 1.00× | 0.93× to 1.07× |
| Shared prompt | Tiny without clone | 2.01 µs | 1.98 µs to 2.04 µs | 1.06× | 1.03× to 1.14× |
| Shared prompt | Tiny (shipped) | 3.21 µs | 3.18 µs to 3.23 µs | 1.69× | 1.65× to 1.82× |
| Same shape | Duplicated | 0.15 µs | 0.14 µs to 0.15 µs | 1.00× | 0.98× to 1.02× |
| Same shape | Aliased | 0.15 µs | 0.14 µs to 0.15 µs | 1.00× | 0.98× to 1.04× |
| Same shape | Tiny without clone | 0.29 µs | 0.29 µs to 0.29 µs | 1.96× | 1.96× to 2.04× |
| Same shape | Tiny (shipped) | 1.72 µs | 1.70 µs to 1.74 µs | 11.81× | 11.74× to 12.14× |

: Time to materialize one session from each store, as medians over independent processes, with the ratio to the duplicated store. {#tbl:latency}

## Real models: prefix reuse speeds prefill and only prefill {#sec:res_llm}

*Tier: measured.* Reusing a shared prefix skips computation, so unlike in-process reconstruction it does save time. Prefill speedups are 1.34× to 3.50× per turn ([@fig:llm_prefill] and [@tbl:llm]). Decode alone is essentially unaffected, at 0.98× to 1.03×, because after prefill both arms hold the same cache and do the same work per token. Over prefill and decode together, including the once-per-trial cost of the shared prefix, the speedup is 1.06× to 1.63×.

![Real forward passes: prefill time per turn when the whole prompt is processed again, and when a shared prefix's key-value tensors are reused so only the session's own tokens are processed. Labels give the speedup. Points are medians of per-trial medians, and their intervals describe repeatability within one process. Reusing a prefix is what a production prefix cache already does, so this compares against a baseline without one.](../../output/figures/llm_prefill.png){#fig:llm_prefill width=92%}

| Model | Backend | Re-prefill | Shared | Prefill | Decode | Both | Tokens equal | Control |
| ------------- | --------- | -----------: | ----------: | --------: | --------: | -------: | -------------: | ----------: |
| distilgpt2 | CPU | 53.22 ms | 15.20 ms | 3.50× | 1.02× | 1.63× | 16 of 16 | caught |
| distilgpt2 | MPS | 22.81 ms | 6.89 ms | 3.31× | 0.98× | 1.40× | 16 of 16 | caught |
| tiny-gpt2 | CPU | 2.03 ms | 0.76 ms | 2.66× | 1.03× | 1.27× | 16 of 16 | missed |
| tiny-gpt2 | MPS | 1.61 ms | 1.21 ms | 1.34× | 1.00× | 1.06× | 16 of 16 | missed |

: Real-model timing by model and backend. Re-prefill and shared give prefill time per turn without and with a shared prefix. Prefill is their ratio. Decode and both (prefill plus decode) are ratios of per-trial totals. Tokens equal counts turns whose greedy output matched exactly between arms, and control says whether the check caught a deliberately wrong cache. {#tbl:llm}

Output equivalence, which the original lab did not check, held: greedy tokens matched in 64 of 64 turns, with a worst last-position logit difference across runs of 1.4e-4 against a declared tolerance of 0.05. A control shows how far to trust that. Given a cache built from the wrong prefix, `distilgpt2`'s logits differ by at least 3.09, so the check fails, although its greedy tokens still match in 30 of 32 turns. Matching tokens alone therefore say little. On `tiny-gpt2` the check passes even then, at 1.9e-5, because that minimal model's logits barely depend on context. The evidence for equivalence is therefore the logit agreement on `distilgpt2`, within 1.4e-4.

The historical 1.17× training speedup does not reappear. In this design both arms perform the same forward, backward and optimizer steps per round, and with warm-up and interleaving the ratio is 1.00× to 1.03× over 60 rounds, with bootstrap intervals spanning 0.94× to 1.09×. The original lab ran one arm entirely before the other, with no warm-up, over five steps. That does not show the historical value was an artifact on its own hardware. It does mean no mechanism in the arms predicts a speedup, and none is seen here.

## Real models: KV residency matches the accounting {#sec:res_residency}

*Tier: measured.* The readings in [@fig:kv_residency] and [@tbl:residency] hold eight sessions of `distilgpt2` live on MPS. The summed tensor sizes equal [@eq:kv] exactly, and the device allocator agrees closely, at 84.4% against 84.1% predicted. This is the first device-memory reduction in this repository measured on a real model's tensors, and it supports the accounting behind the roofline below. Holding the prefix separately has a cost: rebuilding one session's full cache by concatenation takes 0.35 ms on this backend, and the rebuilt tensors match a full prefill to within 2.0e-5.

![Key-value cache held live for 8 sessions of distilbert/distilgpt2 on MPS: 512 shared prefix tokens and 21 tokens per session, by three accountings. Sharing the prefix is predicted to save 84.1%; summed tensor sizes give 84.1% and the device allocator 84.4%.](../../output/figures/kv_residency.png){#fig:kv_residency width=92%}

| Model | Backend | Predicted | Tensors | Allocator | Duplicated | Shared | + weights |
| ------------- | ---------- | -----------: | ----------: | -----------: | -------------: | -----------: | -----------: |
| distilgpt2 | CPU | 84.1% | 84.1% | n/a | 149.9 MiB | 23.9 MiB | 27.3% |
| distilgpt2 | MPS | 84.1% | 84.1% | 84.4% | 154.1 MiB | 24.1 MiB | 27.3% |
| tiny-gpt2 | CPU | 80.9% | 80.9% | n/a | 0.1 MiB | 0.0 MiB | 11.9% |
| tiny-gpt2 | MPS | 80.9% | 80.9% | 78.5% | 0.1 MiB | 0.0 MiB | 11.9% |

: KV residency. Predicted, tensors and allocator are reductions by three accountings. Duplicated and shared are bytes held, on the allocator where one exists and otherwise summed tensors. The last column is the reduction with weights counted, from [@eq:with_weights]. {#tbl:residency}

Counting weights changes the headline. With the 312.5 MiB of weights resident under both designs, the reduction for this run is 27.3%, as [@eq:with_weights] predicts.

## Simulation at datacenter scale {#sec:res_h100}

*Tier: simulated.* On the NVIDIA H100 SXM 80GB profile the same accounting reduces KV by 88.2% and resident memory by 50.8% once weights are counted. The Tiny Footprint arm and the production prefix cache hold the same resident set, a difference of zero bytes, because no KV compression factor has been measured. Peak-bandwidth copy time is an upper bound. No H100 was involved.

## A rhyme's KV state does not stand in for another's {#sec:res_rhyme_kv}

*Tier: simulated, then measured.* FractiAI's latest release adds a second simulated workload, in which sessions fill the same organizational slots with different tokens. A prefix cache cannot share across them, and the simulation gives the rhyme arm 34.3% less KV memory than the cache. That follows from one assumption: that 38.9% of KV memory can be held once because that fraction of a JSON record's bytes can. The constant is typed into the simulation, and the JSON cohort itself gives 36.4%. The workload's equivalence check compares lengths, because the rebuilt tokens differ from the originals by construction, so it cannot fail.

The real-model lab tests the assumption on the tensors. Two prompts match except for 12.5% of their tokens, in evenly spaced slots, which favours sharing more than sessions with different wording would. On `distilgpt2`, 14.6% of key and value cells match within 1%, and all of them lie in one of six layers: the first layer's tensors depend only on a token and its position, and every later layer has already mixed in the changed words. Resuming from the other prompt's cache moves last-position logits by 3.72, which fails the check, although greedy tokens still match in 16 of 16 turns. On this model a rhyme's KV state cannot stand in for another's, and the simulated saving has no measurement behind it.

## The rhyme gate and the companion meters {#sec:res_gate}

*Tier: deterministic.* The same release gates its pin on a four-pillar audit. It refuses a plain wall of repeated records, as it says it does, and it passes the same records once they have a nested field and state a nesting depth and a drift, because two of its pillars read values the caller declares. The gate therefore checks a declaration and not a behaviour. The release also adds companion meters outside the pin: signature routing (3 comparisons against 15 for a scan), context folding (10.0% over a window that drops older turns) and an energy proxy built on assumed constants. FractiAI labels them lab meters, and none reads a device.

## Historical GPU evidence {#sec:res_historical}

*Tier: historical, with an arithmetic check.* The 81.4% allocation reduction reproduces to every digit from the lab's requested buffer sizes, with no GPU, because that is all it is: 288 MiB against 53.6 MiB, computed from 16 sessions, four MiB of KV per session, a 12 MiB system buffer, and a hard-coded assumption that a session's delta is 15% of its KV buffer. The sweep in [@fig:gpu_proxy_sensitivity] shows how that assumption carries the result. The value falls below the 80% gate by a delta of 25%, and it is 62.5% if a session keeps its whole KV buffer.

![The GPU lab's allocation reduction recomputed from its requested buffer sizes, as a function of the assumed per-session delta. The open marker is the value hard-coded in the lab, which reproduces the published figure exactly and needs no GPU. No experiment in this repository measures that fraction.](../../output/figures/gpu_proxy_sensitivity.png){#fig:gpu_proxy_sensitivity width=92%}

The nvidia-smi peak, from 313 to 85 MiB, and the turn speedup, 9.60×, are device readings from that machine and could not be repeated here. The speedup is near the 9.41× ratio of bytes copied per turn, which is what a copy benchmark would be expected to show. The historical receipts do not establish a saving on a model forward. On that lab's real-model run the same nvidia-smi reading was 265 MiB in both arms.
