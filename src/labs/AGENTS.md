# Labs

The invariant: a lab reports only what ran now. `runLabScript` reads a receipt only from a fresh temporary directory it just created. Reading a pre-existing receipt after a failed launch is the defect this replaced: a host with no GPU reported a laptop's GeForce results as its own. Regression tests pin this. `not_run` is its own outcome, distinct from pass and fail.
