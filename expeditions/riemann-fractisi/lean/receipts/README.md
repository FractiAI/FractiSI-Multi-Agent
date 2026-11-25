# receipts

- **Find (primary):** `riemann-fractisi-zeta23-find-*.json` + `riemann-fractisi-zeta23-find-latest.json` from `timing/run-zeta23-find.mjs`
- **No-kit find (capped):** `riemann-fractisi-zeta23-find-no-kit-*.json` + `…-find-no-kit-latest.json` from `timing/run-zeta23-find-no-kit.mjs`
- Verify (prebuilt tree): `riemann-fractisi-zeta23-*.json` + `riemann-fractisi-zeta23-latest.json` from `timing/run-zeta23.mjs` (exclude `*-find-*`)
- Ablation: `riemann-fractisi-ablation-*.json` + `riemann-fractisi-ablation-summary-5runs.json` from `timing/run-ablation.mjs`
- Legacy rebuild: `riemann-fractisi-expedition-phase*.json` from `timing/run-expedition.mjs`

Do not hand-edit measured fields; regenerate with the harness.
