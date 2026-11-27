# FGC news stories

One file per slug, named `<slug>.html`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

## HARD LOCK (Player 1)

1. Each `/blog/<slug>/` page **IS the news article**. No separate “brief” product.
2. Wire-service business journalism: Yes/No headline (major-outlet cadence) → Short answer → punchy lede → context → stakes → numbers. Continuous prose.
3. **ZERO:** README headers, `ENGINE_SHELF`, Soft Story IDs, SHAs, install/setup, code fences, engine pins, cable-network brand names.
4. Keep factual claims already in the post; do not invent new facts.
5. Public chrome says **story** / **news**, not a parallel brief.

Symposium title stays voice-locked: *The Multi-Agent World Inference Rhyme?*

## Required `data-brief` sections

Internal assembly ids only:

1. `birds-eye` — Lede
2. `synthesis` — Context
3. `insights` — Evidence (`data-signal`)
4. `implications` — Why it matters
5. `orientation` — Next steps in short prose
