# FGC news stories

One file per slug, named `<slug>.html`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

## Purpose (Player 1 lock)

`/blog/` is the **Fractal Goldilocks Channel (FGC)** newsroom — a **news channel for executives**.

Each `/blog/<slug>/` page **is the news article**. There is no separate “brief” product beside the post. One page per story: Yes/No title, Short answer, news body.

Wire-service business journalism: punchy lede, context, stakes, numbers. Titles stay Yes/No and must **rhyme with top headlines** from major news desks (AP / Reuters / WSJ / business-TV cadence). Never name cable-network brands.

## Voice

- **Do:** Plain English stakes; short sentences; numbers over jargon.
- **Do not:** README headers; setup/install; engine pins; `ENGINE_SHELF`; Soft Story / experiment ids; SHAs; file paths; npm/scripts; registry keys; “PR #N” as the story; inventing a parallel brief; invented claims; exclamation marks in public chrome.
- When titles change, update ticker source so the feed matches (manifest titles drive `headlines.mjs`).
- Synthesis, implications, and orientation must be **unique per topic** — fallbacks in `executive-brief.mjs` are last resorts only.

## Required `data-brief` sections

Internal assembly ids only (not a public product name):

1. `birds-eye` — Lede
2. `synthesis` — Context
3. `insights` — Evidence (`data-signal`)
4. `implications` — Why it matters
5. `orientation` — Next steps in short prose (no Understand/Reconsider/Watch/Prepare/Do lists)

## Locks

- Yes/No news-desk titles + Short answer under h1
- Body reads as a news article for executives
- Product: **Fractal Goldilocks Channel (FGC)** / FGC Newsroom
- Public chrome says **story** / **news**, not a parallel brief product
