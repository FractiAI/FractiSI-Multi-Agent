# Benchmark methodology

The [manuscript's Methods section](../manuscript/03_methods.md) is the full account. This page explains why the benchmarks are built the way they are, for anyone reading or extending them.

## Why more than one number

The kit's claim is about memory, and memory is hard to measure honestly. Each tier answers a different question, and the gap between tiers is itself a result.

| Tier | Question | Where it runs | Repeats exactly? |
|---|---|---|---|
| Deterministic | How many bytes does each design serialize to? | Any machine | Yes, byte for byte |
| Measured: heap | How much live memory does the JS engine retain? | One host | Within small variation |
| Measured: RSS | How much memory does the operating system see? | One host | Within variation |
| Measured: latency | How long does it take to turn a stored session back into text? | One host | No: describes that host |
| Real-model lab | What do real forward passes cost, and what do real KV tensors occupy? | One host, with PyTorch | Timing no, tensor bytes yes |
| Simulated | What does the accounting imply for a datacenter accelerator? | Any machine | Yes |
| Historical | What was recorded on the original laptop? | Nowhere: read from receipts | Not run |

## Comparing against the right baseline

A reduction is meaningless without saying from what. The benchmarks compare against several designs, because the choice moves the answer.

- **Duplicated**: one complete object per session.
- **Aliased**: shared fields point at one object. This is an ordinary JavaScript reference, which is what a template engine has to beat in live memory.
- **Exact-text cache**: one copy per distinct text.
- **Normalized**: for the graph workload, edges refer to nodes by id, with no template engine.
- **gzip**: not a competing design, because compressed bytes cannot be used in place. It says how much redundancy the data holds.

## Keeping the instrument honest

- **Every measurement is a fresh process**, so JIT and heap state from one condition cannot reach another, and the process is the independent unit the bootstrap resamples.
- **Order is seeded and random**, so slow drift on the host spreads across conditions.
- **The whole build runs twice before the heap is read**, so lazily compiled code and tier-up are not charged to whichever store allocates them. Without this the shipped engine appeared to use more heap than it does, and a smaller warm pass still moved readings by kilobytes between runs.
- **Collection repeats until the heap stops shrinking.** A fixed count is not enough: a discarded store survived two forced collections at one size, was counted in the "before" reading, and made a full store read as almost nothing.
- **Heap processes run without tier-up or concurrent GC.** Compiled code lands in the same heap from a background thread, which moved readings by kilobytes and split some cells into two modes. With it off, nearly every cell reads one exact number. RSS and latency keep normal settings, because they describe a realistic process.
- **A store's total heap must grow with its size**, and verification checks it. A narrow interval shows only that a reading repeats, and a systematic error repeats perfectly. Plot the data too: a figure is what exposed the error above.
- **Two controls measure the instrument**: one allocates nothing, the other a computable amount.
- **RSS is measured separately**, from an off-heap buffer with streaming ingest. Reading RSS after preparing sessions on the heap reads almost nothing, because V8 keeps committed pages.
- **Exactness is checked**: every store must reproduce the original text before its timing counts, and real-model arms must produce the same greedy tokens.
- **The equivalence check is itself tested.** Each real-model run repeats it with a cache built from the wrong prefix. A model whose outputs barely depend on context still passes then, as `tiny-gpt2` does, and its receipt records that the check shows nothing there. Matching tokens are weak evidence even on `distilgpt2`, where a wrong cache leaves most greedy tokens unchanged, so the logit comparison is what catches it.
- **A receipt is bound to what produced it**, and a stale one fails verification. A run that dies cannot leave an older receipt behind, and a host without a planned backend records `not_run`.
- **Load is recorded**. Timing receipts carry the load average at the start and end of each run.

## Fair treatment of the product

Two ablations separate the idea from this implementation, so a cost in the shipped code is not blamed on the concept. `tiny_compact` drops the engine's per-session wrapper, and `tiny_noclone` materializes without `structuredClone`.

## What the labs do not establish

The real-model lab compares reusing a shared prefix against re-prefilling the whole prompt. A production prefix cache already reuses prefixes, so this measures the size of that opportunity and shows no advantage over a server that takes it. Whether two prompts with the same organization and different words can share key-value state at all is an open question that no experiment here tests.
