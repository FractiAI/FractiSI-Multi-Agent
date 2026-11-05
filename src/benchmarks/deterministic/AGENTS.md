# Deterministic tier

Results must be pure functions of the plan: no clock, no host, no `Math.random`. Values that depend on the runtime, like gzip bytes, go in a separate receipt with the version recorded.
