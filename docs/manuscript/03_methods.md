# Methods {#sec:methods}

## Evidence tiers {#sec:tiers}

- **Deterministic.** Byte accounting, with no clock and no description of the host. The receipts are byte-identical on repeated runs.
- **Measured.** Live memory and wall-clock time on one named host, in isolated processes. The values are expected to differ on other machines.
- **Simulated.** Arithmetic over a published hardware profile. No device is touched.
- **Historical.** Receipts recorded on another machine. They are bound by hash and reported as evidence about that machine on that date, never as a current run.

## Host {#sec:host}

Measurements ran on {{HOST_CPU}} with {{HOST_CORES}} logical cores and {{HOST_MEMORY_GIB}} GiB of memory, under {{HOST_PLATFORM}}, with Node {{HOST_NODE}} and V8 {{HOST_V8}}. Real-model runs used Python {{LLM_PYTHON}}, PyTorch {{LLM_TORCH}} [@paszke2019pytorch] and Transformers {{LLM_TRANSFORMERS}} [@wolf2020transformers]. The machine was not idle: other work ran concurrently, and the one-minute load average across the measured runs was {{LOAD_RANGE}}. Receipts record the load at the start and end of each run.

## Deterministic tier {#sec:deterministic}

The study measures the kit at upstream commit `{{KIT_COMMIT}}` ({{KIT_LABEL}}). The registered workloads are the suite's own. Workload B holds structured records, C a cross-linked graph, D one story broadcast to eight nodes, E a lattice of vectors against one request's working set, and F chat sessions sharing a system prompt. All use seed {{SEED_PRIMARY}}, with gateway round trips also checked under {{SEED_VALIDATION}}, and sizes are UTF-8 JSON bytes.

The suite's own exactness checks are partial, so this tier adds a full round trip of every record in B, C, D and F. To test the aggregate, it recomputes [@eq:aggregate] with equal weights, over lossless workloads only, without the baseline of workload C, and leaving out each workload in turn. That baseline embeds full copies of both nodes in every edge, which the suite's source describes as a conventional anti-pattern. Workload C is also compared with a plain normalized graph whose edges refer to nodes by id, with no template engine. As a yardstick for how much redundancy the bytes contain, each lossless workload's conventional JSON is compressed with gzip.

[@prop:saturation] is tested by running workload F's encoding across a grid of {{SCALING_SESSIONS}} sessions and {{SCALING_TURNS}} turns per session. The rhyme is compared with an exact-text cache across a grid of duplicate shares from {{CROSSOVER_LOW}} to {{CROSSOVER_HIGH}}, for {{CROSSOVER_SESSIONS}} same-shaped sessions.

## Measured tier {#sec:measured}

JSON bytes do not see object references, shared hidden classes or allocator behaviour. V8 shares object shapes through hidden classes [@bruni2017fast], so identical keys in many objects are not stored many times. The measured tier therefore reads the heap itself. Every store starts from per-session wire text, as a server receiving request bodies would, so nothing shares memory by accident. The stores are:

- *Duplicated*: one fully parsed object per session.
- *Aliased*: parsed, then shared fields point at a single object. This is an ordinary JavaScript reference and the baseline a template engine must beat in memory.
- *Tiny*: one registered template plus per-session expressions, using the shipped engine.
- *Exact-text cache*: one parsed object per distinct wire text.

Two ablations separate the idea from this implementation of it. *Tiny compact* keeps the template and bare deltas without the engine's per-session wrapper. *Tiny without clone* materializes from the shipped store without `structuredClone`.

**Heap.** Each measurement runs in a fresh process with garbage collection exposed. The whole build runs first and is discarded, so that lazily compiled code and tier-up are not charged to whichever store happens to allocate them. The heap is read on both sides of the build after collecting until it stops shrinking. As a check on the instrument, a store's total heap must grow with its size, and verification enforces this. Tier-up allocates code in the same heap from a background thread, so these processes run with {{HEAP_CHILD_FLAGS}}: retained object layouts do not depend on the tier, and the reading then holds data alone. Latency and RSS keep normal settings, because they describe a realistic process. The design is {{HEAP_WORKLOADS}} workloads across {{HEAP_SESSIONS}} sessions with {{HEAP_TRIALS}} processes per cell, {{HEAP_TOTAL}} in all including controls, run in seeded random order so that drift on the host spreads across conditions, by analogy with setup randomization [@mytkowicz2009producing].

**Controls.** An empty control allocates nothing and a known control allocates a packed array of computable size. They measure the instrument itself.

**Resident set size.** Reading RSS after preparing sessions on the JS heap is confounded, because V8 keeps committed pages after collecting garbage. This design holds all wire text in one off-heap buffer and ingests sessions one at a time. It runs at {{RSS_SESSIONS}} sessions, where the differences resolve, with {{RSS_TRIALS}} processes per store.

**Latency.** Materialization is the time to turn one stored session back into its full request text. Before any timing, every session is checked to reconstruct to its original wire text exactly. Each of {{LAT_PROCESSES}} independent processes per condition warms up for {{LAT_WARMUP}} operations and then times {{LAT_OPS}} operations in batches of {{LAT_BATCH}}, at {{LAT_SESSIONS}} sessions.

**Statistics.** The independent unit is the process [@kalibera2013rigorous; @georges2007statistically]. Point estimates are medians, with quantiles by linear interpolation (type 7) [@hyndman1996sample]. Intervals are percentile bootstrap at {{BOOT_CONFIDENCE}} confidence [@efron1993introduction] with {{BOOT_RESAMPLES}} resamples and seed {{SEED_BOOTSTRAP}}; neither assumes normally distributed timings [@hoefler2015scientific]. Ratios use independent resampling of numerator and denominator. The real-model lab runs one process per combination, so its intervals resample per-trial medians and describe repeatability within that process. All comparisons are descriptive.

## Real-model lab {#sec:llm_methods}

The lab runs {{LLM_RUNS}} combinations of {{LLM_MODEL_NAMES}} on {{LLM_BACKENDS}}, with weights pinned to fixed revisions and held as `{{LLM_DTYPE}}`. The models belong to the GPT-2 family [@radford2019language], whose attention layout is what [@eq:kv] describes. {{LLM_MODEL_ORIGINAL}} repeats the original lab's choice. Its KV cache is too small to measure memory, so {{LLM_MODEL_LARGER}} gives a measurable one. Their shared prefixes are {{LLM_PREFIX_ORIGINAL}} and {{LLM_PREFIX_LARGER}} tokens, with {{LLM_SESSIONS}} sessions of {{LLM_TURNS}} turns, {{LLM_SUFFIX_TOKENS}} suffix tokens and {{LLM_NEW_TOKENS}} decoded tokens.

The original lab tokenized its arms differently, ran one arm entirely before the other, and did not check output equivalence. This lab builds both arms from the same token ids, interleaves them in seeded random order within each turn across {{LLM_TRIALS}} trials, and compares both last-position logits and greedy tokens between arms, turn by turn. A control repeats this with a cache built from the reversed prefix, to test whether the check can detect a wrong cache. A second control tests a rhyme: a prompt that keeps all but {{RHYME_KV_CHANGED}} of its tokens is compared with the original cell by cell, and the lab resumes from its cache. Training arms are warmed up and alternated in the same way. The "with" arm is charged once per trial for prefilling the shared prefix.

KV residency holds every session's cache live and reads three accountings: [@eq:kv], summed tensor sizes, and the device allocator where one exists. "With Tiny Footprint" in this lab means reusing a shared prefix, which is what a production prefix cache does, so the lab tests prefix sharing and not rhyming.

## Simulated and historical evidence {#sec:other_evidence}

The roofline applies [@eq:kv] and [@eq:with_weights] to a published profile of the {{H100_NAME}} [@nvidia2026h100] and a model with the released configuration of Llama 2 7B [@touvron2023llama], with {{H100_SESSIONS}} sessions, {{H100_PREFIX}} prefix tokens and {{H100_SUFFIX}} suffix tokens. The historical receipts come from the {{HIST_DEVICE}}. The GPU lab needs that vendor's runtime, so on this host it records `{{GPU_LIVE_STATUS}}` with reason `{{GPU_LIVE_REASON}}`, and its allocation figure is recomputed with no device.
