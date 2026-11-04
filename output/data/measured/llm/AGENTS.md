# Real-model receipts

`rhymeSharing` is the test of the H100 rhyme arm's premise. Model revisions are pinned in `benchmarks/plan.json`, and each receipt records the plan and lab source that produced it. These receipts hold raw per-call samples so analysis can bootstrap them. `equivalence.control` says whether the check caught a deliberately wrong cache, so read `tokenSequencesEqual` only beside it. A host without a planned backend records `not_run`, and analysis keeps that run and any failed one out of the figures.
