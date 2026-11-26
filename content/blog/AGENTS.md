# Blog content

One file per slug, named `<slug>`. The slug must match its entry in `../manifest.json`. Rebuild with `npm run build:site`.

The `/blog/` index is the FractiSI Newsroom (weather-channel lens). Newscast ticker lines for the past 24 hours are curated in `src/newsroom/headlines.mjs`.

Locked phrases live in the content fragment (not only in generated `blog/*/index.html`). Example: cosmic-rhyme keeps `Cosmos, not Universe` here so regen does not drop the ship-surface test.
