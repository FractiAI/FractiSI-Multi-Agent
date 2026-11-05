# Discussion {#sec:discussion}

## What the evidence supports {#sec:disc_supported}

Sharing a prefix across sessions is a real memory optimization, and on real tensors it behaves as simple accounting predicts. KV residency fell {{KV_DEVICE_REDUCTION}} on the device allocator with logits matching a full prefill, and prefill ran {{LLM_PREFILL_RANGE}} faster. These gains are bounded by [@prop:saturation]. They shrink as conversations lengthen, and they shrink further once model weights are counted, to {{KV_WITH_WEIGHTS}} on the measured run and {{H100_RESIDENT_REDUCTION}} on the roofline. Decode, which dominates long generations, does not change.

The baseline for all of these is re-prefilling the whole prompt on every turn. A production server with a prefix cache already avoids that [@kwon2023efficient; @zheng2023sglang; @gim2023promptcache]. This study therefore shows the size of the prefix-sharing opportunity. It shows no advantage over systems that already take it, and with an exact prefix the simulated arms hold the same resident set for that reason.

## What it does not support {#sec:disc_unsupported}

No receipt in this repository establishes a reduction of {{TARGET}} in DRAM or accelerator memory for AI serving. The aggregate that clears that bar measures serialized bytes, is dominated by two workloads, and includes one that is not lossless and one whose gain comes from normalization. The GPU allocation figure is arithmetic on an unmeasured assumption.

Lower latency also does not follow from reconstructing a working set. In process, reconstruction is slower than reading. Where latency does improve, the cause is skipping model computation, and that is the prefix cache's mechanism.

## Is a rhyme different from a prefix cache? {#sec:disc_rhyme}

The distinctive idea here is that a rhyme can share organization when the words differ, where a prefix cache cannot share anything. The byte results show that this holds for serialized structure. In a live JavaScript heap, much of it is already shared: hidden classes cover repeated keys [@bruni2017fast] and ordinary references cover repeated values, and the shipped engine gives back part of the rest through its per-session wrapper. A tighter encoding of the same idea roughly matches plain references, at {{HEAP_RHYME_COMPACT}} against {{HEAP_RHYME_ALIASED}}, because a session stops storing fields that repeat a default. That is the strongest in-process result for the idea, though it comes from an ablation and not the shipped engine.

The question that matters for accelerators is whether two prompts with the same organization and different words can share KV state at all. Attention state depends on the tokens, so this does not follow from sharing a schema, and on {{KV_MODEL}} it mostly cannot happen: only the first layer's cells repeat, and a cache taken from the other prompt changes the logits ([@sec:res_rhyme_kv]). That is one small model, so it does not rule out another scheme. A demonstration would need a larger model, a defined notion of acceptable output, and a measured saving beyond a prefix cache. Until then, applying a byte fraction measured on JSON to KV-cache memory has no support from this evidence, and the one test here goes against it.

## Recommendations {#sec:disc_recommendations}

For the engine, removing `structuredClone` from reconstruction and dropping the per-session wrapper would recover most of the measured latency cost and turn the same-shape heap result from {{HEAP_RHYME_TINY}} into {{HEAP_RHYME_COMPACT}}, as the ablations show, and neither changes the idea. For the kit's public language, the evidence supports statements of the form "sharing a prefix reduced KV residency by this much, on this workload, on this hardware, compared with no sharing". It does not support a general percentage. For the suite's gate, an aggregate that excludes non-lossless workloads and states its weighting would measure what the gate appears to promise, and its rhyme audit would need to measure nesting and drift and not read them from the caller. The H100 rhyme arm needs a fraction measured on KV tensors and an equivalence check that compares tokens.
