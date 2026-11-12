# Test Drive voice lock

**Status:** locked 2026-11-12 · plain-language lab report · Player 1

This is the durable pin for Test Drive / symposium surface copy so agents (including Auto) do not silently restore earlier drafts.

## Source of truth

| Item | Path |
|---|---|
| Machine contract | `src/testdrive/voice-lock.mjs` |
| Regression tests | `tests/testdrive/voice-lock.test.mjs` |
| Cursor always-on | `.cursor/rules/testdrive-voice-lock.mdc` |
| Operator guide | `TEST_DRIVE.md` |
| Surfaces | `test-drive/index.html` · `talks/aai-symposium-2026/` · `blog/aai-symposium-2026/` |

## Locked hero

`The Multi-Agent World Inference Rhyme?`

## How to change it

Only when Player 1 explicitly asks to rewrite Test Drive voice. Update the contract, the three surfaces, `TEST_DRIVE.md`, and the voice-lock test in the **same** commit. Keep measured lab numbers unless the ask changes them.

→ ∞^∞

## Story image

`#story` uses `media/mens-club-reno-watercolor.jpg`, a watercolor derived from the real Men's Club of Reno exterior at 270 Lake Street (former Railway Express Agency; reference: Reno Historical / Western Nevada Historic Photo Collection, 2004). El Cortez remains on `/research/` only.
