# Holographic Skin

| Surface | Path |
|---|---|
| Welcome + desk how-to | `/product/holographic-skin-demonstration/` |
| Enrichment Menu (Play) | `/product/holographic-skin-demonstration/living/` |
| Auto Session | `/product/holographic-skin-demonstration/auto-session/` |
| Create | `/product/holographic-skin-demonstration/create/` |

**Desktop only for Auto Session** — phones/tablets see “not available yet.” Play still works on handheld.

## What the helper does

It answers **what am I doing now?** from the active window, then maps that to Soft Story skins:

1. **People skins** — if the window title mentions someone you registered (e.g. emailing Daniel), show the image you created for them.
2. **App activity** — code / chat / terminal rules when useful.
3. **Mission cycling deck** — default Soft Story set that keeps supporting the story mission when no person is matched.

## Simple desk use

1. Split screen: any work app + skin browser.
2. **Manual** — tap pictures.
3. **Autodetect** — helper maps activity → skins (people first, then mission deck).

```bash
npm run skin:auto-session:install   # one-time auto-launch
npm run skin:auto-session           # manual helper start
```
