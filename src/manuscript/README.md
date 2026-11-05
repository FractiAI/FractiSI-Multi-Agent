# Manuscript machinery

Turns the analysis summary into the values the manuscript states.

## Contents

| Path | What it is |
|---|---|
| [`contract.mjs`](contract.mjs) | The hard-coded value gate: authored sections may not state a study value. |
| [`formalism.mjs`](formalism.mjs) | The manuscript's formal statements, listed for the template's evidence registry. |
| [`hydrate.mjs`](hydrate.mjs) | Hydrate authored sections into output/manuscript/. |
| [`pipeline.mjs`](pipeline.mjs) | Stage body: build the token catalog, enforce the contract, and hydrate the manuscript. |
| [`source-path.mjs`](source-path.mjs) | Read a value from the analysis summary by a recorded path, such as `heap.rows[workload=ai_context,sessions=1024,condition=tiny].heap.estimate`. |
| [`tables.mjs`](tables.mjs) | Result tables for the manuscript and generated docs, rendered from the summary. |
| [`tokens.mjs`](tokens.mjs) | The token catalog: every value the manuscript may state, bound to a source path in the analysis summary and one presentation format. |
