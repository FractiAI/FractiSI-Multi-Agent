# Pipeline

The stage graph in provenance order, its runner, and the binding to the template that renders and validates the PDF.

## Contents

| Path | What it is |
|---|---|
| [`render.mjs`](render.mjs) | Render the hydrated manuscript through the template, then bind the PDF to what it was rendered from. |
| [`runner.mjs`](runner.mjs) | Check what the selected stages need, then run them in order and stop at the first failure. |
| [`stages.mjs`](stages.mjs) | The pipeline DAG, in provenance order: plan and source, receipts, analysis, figures, hydration, render, template validation, verification. |
| [`suite.mjs`](suite.mjs) | The suite pipeline behind `npm run research`. |
| [`template.mjs`](template.mjs) | Binding to a docxology/template checkout, which owns rendering. |
| [`validate.mjs`](validate.mjs) | Run the template's own output validator over the rendered project. |
