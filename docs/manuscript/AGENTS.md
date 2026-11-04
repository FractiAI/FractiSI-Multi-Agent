# Manuscript

A number typed here fails the build. Add a token in `src/manuscript/tokens.mjs` and write `{{TOKEN}}`: see [SYNTAX.md](SYNTAX.md).

Token values update on their own and sentences do not. After measured data changes, reread every interpretive sentence against the new values in `output/manuscript/`, because a sentence can become false while its numbers stay correct. This matters most for words like "close", "most" and "nearly".

Cite a formal statement as `[@prop:x]` only if a `::: {.proposition #prop:x}` block defines it. The template's evidence registry reads such a reference as a citation, and `output/data/formalism_claim_ledger.json`, derived from these blocks, is what lets it resolve.

Prefer stating a result with its tier, denominator and baseline. A reduction with no baseline is not a result here.

A citation supports the sentence beside it only if the source says so. Check the source. Add entries to `references.bib` only after resolving the identifier.

Verify with `node scripts/run_pipeline.mjs --rebuild`, then read the rendered pages. A clean exit does not show the layout is right.
