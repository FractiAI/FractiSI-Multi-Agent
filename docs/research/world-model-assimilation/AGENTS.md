# Agents · World Model Assimilation

When working in this folder:

1. Read `EXECUTIVE_RECOMMENDATION.md` first for the decision.
2. Do not merge predictive futures into authoritative state without an approval gate.
3. Do not download large external model weights unless a specific measured experiment requires them and licensing is cleared in `OPEN_SOURCE_LICENSE_AUDIT.md`.
4. Prefer rebuilding patterns into FractiSI (`src/experiments/predictive-shared-state.mjs`) over wrapping WFMs.
5. Re-run `npm run research:world-model-assimilation` after changing the prototype; update `EXPERIMENT_RESULTS.md` with measured numbers only.
