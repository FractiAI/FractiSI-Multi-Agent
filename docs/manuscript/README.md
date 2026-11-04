# Manuscript

The authored source of *Measuring Shared-Representation Memory Claims*. This folder holds prose with `{{TOKEN}}` markers and no study values. Building it injects values from the receipts and renders through [the docxology reproducible-research template](https://github.com/docxology/template).

**Read the result:** [the rendered PDF](../../output/pdf/tiny-footprint-workstation_combined.pdf). Status: [MANUSCRIPT_STATUS.md](MANUSCRIPT_STATUS.md).

| File | Content |
|---|---|
| [00_abstract.md](00_abstract.md) | Abstract |
| [01_introduction.md](01_introduction.md) | The claims under test, and the defect corrected |
| [02_formalism.md](02_formalism.md) | The saturation bound, the aggregate as a weighted mean, KV accounting |
| [03_methods.md](03_methods.md) | Tiers, host, design, statistics |
| [04_results.md](04_results.md) | Results by tier |
| [05_discussion.md](05_discussion.md) | What is and is not supported |
| [06_limitations.md](06_limitations.md) | Threats to validity |
| [07_related_work.md](07_related_work.md) | Prior work |
| [08_reproducibility.md](08_reproducibility.md) | How to rebuild, and what repeats |
| [S01_claim_ledger.md](S01_claim_ledger.md) | The computed claim ledger |
| [99_references.md](99_references.md) | Bibliography heading |
| [config.yaml](config.yaml) | Metadata for the title page and render formats |
| [preamble.md](preamble.md) | LaTeX packages |
| [references.bib](references.bib) | Bibliography |
| [SYNTAX.md](SYNTAX.md) | Tokens, figures, cross-references |

## Build

```bash
node scripts/run_pipeline.mjs --rebuild
```

That runs analysis, figures, hydration, the results page, rendering, the template's validator and verification from the receipts on disk, and it needs a template checkout. The template also reads `experiment_plan.yaml` (conditions, primary metric, expected figures), `domain_profile.yaml` (the study's domain and citation policy), `CITATION.cff` and `codemeta.json` at the repository root. See [running the benchmarks](../benchmarks/running.md#rendering-the-manuscript) for connecting a template checkout.

The hydrated sections are in [`output/manuscript/`](../../output/manuscript/README.md). Each value's source is in `output/data/manuscript_catalog.json`.
