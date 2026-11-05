# Limitations {#sec:limitations}

**One host, under load.** Measurements come from one machine that was running other work, with a one-minute load average of 0.64 to 18.71 on 4 logical cores. Heap readings are insensitive to this, as the controls show. Timings are not, so the timing ratios describe this configuration. Medians over isolated processes and randomized order reduce the risk of bias but do not remove it, because a seemingly innocuous detail of the setup can bias a measurement [@mytkowicz2009producing].

**One runtime.** The heap results describe V8. A runtime without hidden classes, or a compact binary layout, could behave differently, and neither should be inferred from these results. They do describe the engine as shipped, which is JavaScript.

**Synthetic workloads.** Sessions are generated, not captured from production, and the workload parameters are the suite's. [@prop:saturation] says which parameters matter: a real deployment's shared fraction determines its saving, and it should be measured.

**Small models, no production server.** The real-model lab used small GPT-2-family models on one consumer accelerator and on CPU, with no batching, paging or production scheduler. It measures the mechanism and not a serving system, and the rhyme control covers one model and one pattern of changed slots. Output equivalence here means matching greedy tokens and close logits under one tolerance, on the prompts tested, and it is informative only for a model whose check catches a wrong cache. It does not address answer quality.

**Hardware not reproduced.** The GPU lab was not executed in this study, because this host lacks its runtime. Its modularized code keeps the original logic and reports `not_run` here, but it has not been re-run on NVIDIA hardware since the change, and the historical receipts remain the only record of its device readings. They are from one laptop on one date.

**No preregistration.** All analyses are exploratory, and the alternative aggregates were chosen after seeing the suite's design. They are offered as sensitivity checks on a published number and not as better definitions of it.

**Independence.** The kit and its original suite are FractiAI's. The author previously contributed an audit of this repository, and this study has not been independently replicated.
