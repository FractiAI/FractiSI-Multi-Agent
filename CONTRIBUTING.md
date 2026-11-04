# Contributing

Thanks for testing Tiny Footprint. This repository is a workstation kit; keep changes focused and reproducible.

## Local checks

Use Node.js 18 or newer.

```bash
npm test
node scripts/tiny.mjs doctor
node scripts/tiny.mjs demo
```

If you change the research suite, run its pipeline from the suite directory:

```bash
cd research/synthobs-tiny-gateway-rhyming-templates
npm run research
```

GPU labs are optional and local-only. Do not commit regenerated receipts unless the change is specifically about the published evidence.

## Change rules

- Never commit credentials, `.env` files, share packets, or validation-join records.
- Keep benchmark claims tied to a receipt and its hardware class. Do not turn a local GeForce measurement into a datacenter HBM claim.
- Update the matching document when behavior changes: `README.md`, `QUICKSTART.md`, `docs/`, or the suite status.
- Keep `docs/TECH_PAPER.md` and its suite copies byte-identical.
- Do not commit generated `benchmarks/reports/` output.

## Reporting

Report security issues privately using [SECURITY.md](./SECURITY.md). Product and validation questions can go to `valetpru@gmail.com`.
