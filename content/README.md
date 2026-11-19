# Site content

The source for the blog and paper pages. `scripts/build-site.mjs` turns it into `blog/`, `library/` and the shared header and footer.

## Contents

| Path | What it is |
|---|---|
| [`manifest.json`](manifest.json) | Index of every blog post and paper: title, date, group, summary. |
| [`blog/`](blog) | Blog post bodies, one HTML fragment per post. |
| [`papers/`](papers) | Paper sources, Markdown where one exists and an HTML fragment otherwise. |

## Rebuild

```bash
npm run build:site
```
