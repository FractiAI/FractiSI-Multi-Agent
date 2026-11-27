# FGC brief content

One file per slug, named `<slug>.html`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

The `/blog/` index is the **Fractal Goldilocks Channel (FGC)** — a living executive intelligence dashboard. Each post is an **executive intelligence brief** (CNBC-rhyme dense brief), not a conventional blog essay.

## Voice (Player 1 lock)

Busy executives should **want to finish** every brief. Write clear stakes → plain finding → labeled evidence → topic-specific implications → concrete orientation.

- **Do:** CNBC/Bloomberg morning-brief density; everyday stakes (budgets, fleets, trust, jobs); Soft Story explained once as a regenerable computational lab receipt.
- **Do not:** cryptic catalog leads (ENGINE_SHELF-first openers), identical template paragraphs across posts, jargon walls, invented claims.
- Synthesis, implications, and orientation must be **unique per topic** — fallbacks in `executive-brief.mjs` are last resorts only.

## Required `data-brief` sections

New posts inherit structure from `src/newsroom/executive-brief.mjs` via `scripts/build-site.mjs`. Fragments must declare:

1. `data-brief="birds-eye"` — Bird's-eye view (stakes + plain finding)
2. `data-brief="synthesis"` — Fractal Holographic Goldilocks synthesis (topic-specific)
3. `data-brief="insights"` — Separate signal from noise (`data-signal="fact|experimental|interpretation|hypothesis|speculation"`)
4. `data-brief="implications"` — Why it matters (topic-specific)
5. `data-brief="orientation"` — Practical orientation (understand / reconsider / watch / prepare / do — topic-specific)

Optional trailing `<p class="honesty">…</p>`. Related rhymes + supporting papers are assembled by the builder.

## Locks

- Yes/No question titles + `answerHead` Short answer: Yes/No under h1 (manifest)
- No exclamation marks in public brief chrome
- Do not invent empirical claims; label Fractal Holographic Goldilocks interpretation vs evidence
- Core path: Read the brief → follow the rhyme → open the paper → use synthesis to navigate next
- Product name: **Fractal Goldilocks Channel (FGC)**

Ticker lines: `src/newsroom/headlines.mjs`. Re-runnable structure helper: `node scripts/migrate-fgc-briefs.mjs` (skips already-structured fragments).
