# Holographic Skin

FractiSI Soft Story product surface on this site:

| Surface | Path |
|---|---|
| Welcome + desk how-to | `/product/holographic-skin-demonstration/` |
| Enrichment Menu (Play) | `/product/holographic-skin-demonstration/living/` |
| Auto Session | `/product/holographic-skin-demonstration/auto-session/` |
| Create | `/product/holographic-skin-demonstration/create/` |

## How to use it at the desk (everyday)

Split the screen in two:

1. **One half** — your work app. For Prudencio right now: **Cursor** (the AI session).
2. **Other half** — this Holographic Skin in the browser, with a scene full display (favorite start: **Superhero**).

That two-room desk is the immediate deliverable. Keep coding on one side; keep the Soft Story picture on the other.

## Auto Session (next layer)

One-click companion that:

- Opens the skin half (Living deep link with scene + auto mode)
- Leaves / finds your other-half app (default **Cursor**)
- Tries to tile the two halves (Linux + `xdotool`; elsewhere snap manually)
- Detects active window / app titles and Enrichment Menu selections
- Auto-selects or cycles configured Soft Story stills to coordinate

```bash
npm run skin:auto-session
```

Flags: `--port 18765` · `--scene superhero` · `--other Cursor` · `--url <base>` · `--companion-only` · `--no-open`

Companion API (localhost only): `/health` · `/state` · `/config` · `/menu` · `/split` · `/open-skin`

Living deep links: `?scene=superhero&stage=1&auto=1&companion=18765`
