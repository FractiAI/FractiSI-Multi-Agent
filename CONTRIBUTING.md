# Contributing

Thanks for testing Tiny Footprint. This repository is a workstation kit; keep changes focused and reproducible.

## Local checks

Node 18 or newer, plus [uv](https://docs.astral.sh/uv/) for the Python labs and figures.

```bash
npm test                          # Node tests and repository gates
uv sync --group dev --group figures
uv run pytest
uv run ruff check src/tiny_footprint_labs tests/tiny_footprint_labs tests/integration scripts
uv run mypy
node scripts/verify_project.mjs --before-render   # the provenance chain, without the PDF
```

[docs/development/](./docs/development/README.md) covers testing, conventions and how to extend the code. GPU labs are optional and local-only.

## Change rules

- Never commit credentials, `.env` files, share packets, or validation-join records. Everything under `benchmarks/reports/` except its guides is gitignored for this reason.
- Keep benchmark claims tied to a receipt and its hardware class. Do not turn a local GeForce measurement into a datacenter HBM claim.
- Fix producers, then regenerate. Files under `output/`, `docs/benchmarks/RESULTS.md` and the README's generated block are not edited by hand.
- Measure again after changing anything listed in `src/benchmarks/fingerprint.mjs`, even a comment. Verification rejects stale receipts.
- Keep logic in `src/` with a mirrored test, keep dependencies pointing down, keep `scripts/` thin, and give every new folder a `README.md` and an `AGENTS.md`. Gates check all four.
- Update the matching document when behaviour changes.
- Keep the two whitepaper copies under `research/` byte-identical.

## Reporting

Report security issues privately using [SECURITY.md](./SECURITY.md). Product and validation questions can go to `valetpru@gmail.com`.
