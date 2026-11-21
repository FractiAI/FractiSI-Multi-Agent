# Holographic Skin

FractiSI Soft Story product surface on this site:

| Surface | Path |
|---|---|
| Welcome + desk how-to | `/product/holographic-skin-demonstration/` |
| Enrichment Menu (Play) | `/product/holographic-skin-demonstration/living/` |
| Auto Session | `/product/holographic-skin-demonstration/auto-session/` |
| Create | `/product/holographic-skin-demonstration/create/` |

## Simple desk instructions

1. **Split your screen.** Work on one half. Skin (browser) on the other.
2. **Other half = any app you choose.** Not required to be an IDE. Cursor, Slack, Mail, Chrome, a spreadsheet — whatever you use. (Prudencio often uses Cursor.)
3. **Pictures — two modes on Auto Session:**
   - **Manual** — tap a scene; that picture stays until you pick another.
   - **Autodetect** — run the helper; pictures follow detected activity from your rules.

## Autodetect helper (optional)

```bash
npm run skin:auto-session
# optional: --other "Slack" --scene superhero --port 18765
```

Companion API (localhost): `/health` · `/state` · `/config` · `/menu` · `/split` · `/open-skin`

Living deep links: `?scene=superhero&stage=1&auto=1&companion=18765`
