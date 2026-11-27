# FGC news stories

One file per slug, named `<slug>.html`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

## HARD LOCK (Player 1)

1. Each `/blog/<slug>/` page **IS the news article**. No separate “brief” product.
2. Wire-service business journalism: Yes/No headline (major-outlet cadence) → Short answer → punchy lede → context → stakes → numbers. Continuous prose.
3. **Not programming notes.** Do not ship one-sentence stubs per section. Aim for a full news story (~400+ prose words): birds-eye 2–3 paragraphs, synthesis 2–3, insights as full paragraphs inside `data-signal` blocks, implications 2 paragraphs, orientation 1–2 paragraphs plus paper links.
4. **ZERO:** README headers, `ENGINE_SHELF`, Soft Story IDs, SHAs, install/setup, code fences, engine pins, cable-network brand names.
5. Keep factual claims already in the post; do not invent new facts.
6. Public chrome says **story** / **news**, not a parallel brief.

Symposium title stays voice-locked: *The Multi-Agent World Inference Rhyme?*

## Required `data-brief` sections

Internal assembly ids only:

1. `birds-eye` — Lede
2. `synthesis` — Context
3. `insights` — Evidence (`data-signal`)
4. `implications` — Why it matters
5. `orientation` — Next steps in short prose
