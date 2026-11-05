# Gates

Rules about the repository itself. They run in tests and in project verification.

## Contents

| Path | What it is |
|---|---|
| [`doc-links.mjs`](doc-links.mjs) | Relative links in authored Markdown must resolve. |
| [`files.mjs`](files.mjs) | Repository walking shared by the gates. |
| [`folder-guides.mjs`](folder-guides.mjs) | Every folder ships a README.md for people and an AGENTS.md for agents. |
| [`index.mjs`](index.mjs) | All repository structure gates, run together by tests and by project verification. |
| [`layers.mjs`](layers.mjs) | Dependencies point down. |
| [`research-paper.mjs`](research-paper.mjs) | The research paper's two copies stay identical, keep their characters, and name commands that exist. |
| [`shims.mjs`](shims.mjs) | Compatibility paths stay compatibility paths. |
| [`site-links.mjs`](site-links.mjs) | Links in the published HTML pages must resolve, as vercel.json serves them. |
| [`test-mirror.mjs`](test-mirror.mjs) | Tests mirror the source tree. |
| [`thin-scripts.mjs`](thin-scripts.mjs) | Scripts orchestrate; they hold no logic. |
