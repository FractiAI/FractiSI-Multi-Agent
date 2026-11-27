# FGC brief content

One file per slug, named `<slug>.html`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

The `/blog/` index is the **Fractal Goldilocks Channel (FGC)** — a living executive intelligence dashboard. Each post is an **executive intelligence brief** (CNBC-rhyme dense brief), not a conventional blog essay.

## Required `data-brief` sections

New posts inherit structure from `src/newsroom/executive-brief.mjs` via `scripts/build-site.mjs`. Fragments must declare:

1. `data-brief="birds-eye"` — Bird's-eye view
2. `data-brief="synthesis"` — Fractal Holographic Goldilocks synthesis
3. `data-brief="insights"` — Separate signal from noise (`data-signal="fact|experimental|interpretation|hypothesis|speculation"`)
4. `data-brief="implications"` — Why it matters
5. `data-brief="orientation"` — Practical orientation (understand / reconsider / watch / prepare / do)

Optional trailing `<p class="honesty">…</p>`. Related rhymes + supporting papers are assembled by the builder.

## Locks

- Yes/No question titles + `answerHead` Short answer: Yes/No under h1 (manifest)
- No exclamation marks in public brief chrome
- Do not invent empirical claims; label Fractal Holographic Goldilocks interpretation vs evidence
- Core path: Read the brief → follow the rhyme → open the paper → use synthesis to navigate next

Ticker lines: `src/newsroom/headlines.mjs`. Re-runnable structure helper: `node scripts/migrate-fgc-briefs.mjs` (skips already-structured fragments).
