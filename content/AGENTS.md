# Site content

Edit here, then run `npm run build:site`. Do not hand-edit the generated pages under `blog/` or `library/`: the next build overwrites them.

- A new post or paper needs a `manifest.json` entry and a file under `blog/` or `papers/`.
- Papers keep their honesty boundary first. The build drops internal-only sections and rewords repository jargon for the public pages.
- Blog and paper pages share one layout, so a style change goes in `css/site.css`, not in a page.
