# Experiments

The registered suite. Each module has a `build…Workload` that creates the data and an `experiment…` that measures it, so stricter checks elsewhere can use the identical data.

## Contents

| Path | What it is |
|---|---|
| [`a-illustrative-model.mjs`](a-illustrative-model.mjs) | A: illustrative section 7 arithmetic. |
| [`b-structured-data.mjs`](b-structured-data.mjs) | B: structured records sharing a rhyming template. |
| [`c-cross-linked.mjs`](c-cross-linked.mjs) | C: a cross-linked graph, with edges duplicating their nodes versus shared references. |
| [`constants.mjs`](constants.mjs) | The suite's identifiers, seeds and targets. |
| [`d-eight-node.mjs`](d-eight-node.mjs) | D: one originating story broadcast to eight nodes at once. |
| [`e-cross-octave.mjs`](e-cross-octave.mjs) | E: a cross-octave lattice versus one request's selective working set. |
| [`f-ai-context.mjs`](f-ai-context.mjs) | F: chat sessions with a repeated system prompt and per-turn deltas. |
| [`g-gateway-exactness.mjs`](g-gateway-exactness.mjs) | G: gateway end-to-end exact reconstruction under primary and validation seeds. |
| [`h-engine-pin-gate.mjs`](h-engine-pin-gate.mjs) | H: ENGINE_SHELF pin gate. |
| [`i-gpu-live-chat.mjs`](i-gpu-live-chat.mjs) | I: live GPU chat stack, device memory and materialization latency. |
| [`index.mjs`](index.mjs) | Re-exports this folder's public API. |
| [`j-gpu-llm-real.mjs`](j-gpu-llm-real.mjs) | J: real local-accelerator LLM inference and training. |
| [`rhyme-vs-cache.mjs`](rhyme-vs-cache.mjs) | Rhyme versus exact-text cache. |
| [`s-h100-rhyme-sim.mjs`](s-h100-rhyme-sim.mjs) | S: the H100 rhyme-versus-prefix simulation. |
| [`suite.mjs`](suite.mjs) | The registered experiment suite: deterministic workloads plus the optional accelerator labs, with an explicit verdict that keeps `not_run` distinct from both pass and fail. |
