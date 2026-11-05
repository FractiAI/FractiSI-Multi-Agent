# Methods {#sec:methods}

## Evidence tiers {#sec:tiers}

- **Deterministic.** Byte accounting, with no clock and no description of the host. The receipts are byte-identical on repeated runs.
- **Measured.** Live memory and wall-clock time on one named host, in isolated processes. The values are expected to differ on other machines.
- **Simulated.** Arithmetic over a published hardware profile. No device is touched.
- **Historical.** Receipts recorded on another machine. They are bound by hash and reported as evidence about that machine on that date, never as a current run.

## Host {#sec:host}

Measurements ran on Intel(R) Xeon(R) Processor with 4 logical cores and 16 GiB of memory, under linux 6.12.94+ on x64, with Node v22.23.4 and V8 12.4.254.21-node.57. Real-model runs used Python 3.13.17, PyTorch 2.15.0 [@paszke2019pytorch] and Transformers 5.22.1 [@wolf2020transformers]. The machine was not idle: other work ran concurrently, and the one-minute load average across the measured runs was 0.64 to 18.71. Receipts record the load at the start and end of each run.

## Deterministic tier {#sec:deterministic}

The study measures the kit at upstream commit `733b48e` (v1.3 companions). The registered workloads are the suite's own. Workload B holds structured records, C a cross-linked graph, D one story broadcast to eight nodes, E a lattice of vectors against one request's working set, and F chat sessions sharing a system prompt. All use seed 20261103, with gateway round trips also checked under 202611032, and sizes are UTF-8 JSON bytes.

The suite's own exactness checks are partial, so this tier adds a full round trip of every record in B, C, D and F. To test the aggregate, it recomputes [@eq:aggregate] with equal weights, over lossless workloads only, without the baseline of workload C, and leaving out each workload in turn. That baseline embeds full copies of both nodes in every edge, which the suite's source describes as a conventional anti-pattern. Workload C is also compared with a plain normalized graph whose edges refer to nodes by id, with no template engine. As a yardstick for how much redundancy the bytes contain, each lossless workload's conventional JSON is compressed with gzip.

[@prop:saturation] is tested by running workload F's encoding across a grid of 11 session counts up to 1,024 sessions and 1, 5, 25 and 125 turns per session. The rhyme is compared with an exact-text cache across a grid of duplicate shares from 0% to 100%, for 40 same-shaped sessions.

## Measured tier {#sec:measured}

JSON bytes do not see object references, shared hidden classes or allocator behaviour. V8 shares object shapes through hidden classes [@bruni2017fast], so identical keys in many objects are not stored many times. The measured tier therefore reads the heap itself. Every store starts from per-session wire text, as a server receiving request bodies would, so nothing shares memory by accident. The stores are:

- *Duplicated*: one fully parsed object per session.
- *Aliased*: parsed, then shared fields point at a single object. This is an ordinary JavaScript reference and the baseline a template engine must beat in memory.
- *Tiny*: one registered template plus per-session expressions, using the shipped engine.
- *Exact-text cache*: one parsed object per distinct wire text.

Two ablations separate the idea from this implementation of it. *Tiny compact* keeps the template and bare deltas without the engine's per-session wrapper. *Tiny without clone* materializes from the shipped store without `structuredClone`.

**Heap.** Each measurement runs in a fresh process with garbage collection exposed. The whole build runs first and is discarded, so that lazily compiled code and tier-up are not charged to whichever store happens to allocate them. The heap is read on both sides of the build after collecting until it stops shrinking. As a check on the instrument, a store's total heap must grow with its size, and verification enforces this. Tier-up allocates code in the same heap from a background thread, so these processes run with `--no-opt`, `--no-maglev`, `--no-sparkplug` and `--single-threaded-gc`: retained object layouts do not depend on the tier, and the reading then holds data alone. Latency and RSS keep normal settings, because they describe a realistic process. The design is three workloads across 16, 64, 256 and 1,024 sessions with 21 processes per cell, 1,218 in all including controls, run in seeded random order so that drift on the host spreads across conditions, by analogy with setup randomization [@mytkowicz2009producing].

**Controls.** An empty control allocates nothing and a known control allocates a packed array of computable size. They measure the instrument itself.

**Resident set size.** Reading RSS after preparing sessions on the JS heap is confounded, because V8 keeps committed pages after collecting garbage. This design holds all wire text in one off-heap buffer and ingests sessions one at a time. It runs at 16,384 sessions, where the differences resolve, with 11 processes per store.

**Latency.** Materialization is the time to turn one stored session back into its full request text. Before any timing, every session is checked to reconstruct to its original wire text exactly. Each of 15 independent processes per condition warms up for 4,000 operations and then times 4,000 operations in batches of 16, at 64 sessions.

**Statistics.** The independent unit is the process [@kalibera2013rigorous; @georges2007statistically]. Point estimates are medians, with quantiles by linear interpolation (type 7) [@hyndman1996sample]. Intervals are percentile bootstrap at 95% confidence [@efron1993introduction] with 4,000 resamples and seed 20261105; neither assumes normally distributed timings [@hoefler2015scientific]. Ratios use independent resampling of numerator and denominator. The real-model lab runs one process per combination, so its intervals resample per-trial medians and describe repeatability within that process. All comparisons are descriptive.

## Real-model lab {#sec:llm_methods}

The lab runs four combinations of `distilgpt2` and `tiny-gpt2` on CPU and MPS, with weights pinned to fixed revisions and held as `float32`. The models belong to the GPT-2 family [@radford2019language], whose attention layout is what [@eq:kv] describes. `tiny-gpt2` repeats the original lab's choice. Its KV cache is too small to measure memory, so `distilgpt2` gives a measurable one. Their shared prefixes are 256 and 512 tokens, with eight sessions of two turns, 21 suffix tokens and eight decoded tokens.

The original lab tokenized its arms differently, ran one arm entirely before the other, and did not check output equivalence. This lab builds both arms from the same token ids, interleaves them in seeded random order within each turn across 15 trials, and compares both last-position logits and greedy tokens between arms, turn by turn. A control repeats this with a cache built from the reversed prefix, to test whether the check can detect a wrong cache. A second control tests a rhyme: a prompt that keeps all but 12.5% of its tokens is compared with the original cell by cell, and the lab resumes from its cache. Training arms are warmed up and alternated in the same way. The "with" arm is charged once per trial for prefilling the shared prefix.

KV residency holds every session's cache live and reads three accountings: [@eq:kv], summed tensor sizes, and the device allocator where one exists. "With Tiny Footprint" in this lab means reusing a shared prefix, which is what a production prefix cache does, so the lab tests prefix sharing and not rhyming.

## Simulated and historical evidence {#sec:other_evidence}

The roofline applies [@eq:kv] and [@eq:with_weights] to a published profile of the NVIDIA H100 SXM 80GB [@nvidia2026h100] and a model with the released configuration of Llama 2 7B [@touvron2023llama], with 16 sessions, 2,048 prefix tokens and 128 suffix tokens. The historical receipts come from the NVIDIA GeForce GTX 860M. The GPU lab needs that vendor's runtime, so on this host it records `not_run` with reason `nvcuda_unavailable`, and its allocation figure is recomputed with no device.
