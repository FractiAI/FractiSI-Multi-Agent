# Holographic Skin

| Surface | Path |
|---|---|
| Welcome + desk how-to | `/product/holographic-skin-demonstration/` |
| Enrichment Menu (Play) | `/product/holographic-skin-demonstration/living/` |
| Auto Session | `/product/holographic-skin-demonstration/auto-session/` |
| Create | `/product/holographic-skin-demonstration/create/` |

**Desktop only for Auto Session** — phones and tablets see a clear “not available yet” notice. Enrichment Menu Play still works on handheld.

## Simple desk instructions

1. Split the screen: any work app on one half (not required to be an IDE), skin browser on the other.
2. **Manual** — tap pictures on Auto Session.
3. **Autodetect** — select Autodetect; the page tries to start the local helper automatically and pictures follow activity.

### One-time helper auto-launch (desktop)

```bash
npm run skin:auto-session:install
```

Registers `fractisi-skin://` so choosing Autodetect can start the helper without typing a command each time.

Manual start still works: `npm run skin:auto-session`
