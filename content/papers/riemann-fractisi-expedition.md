# FractiSI Matched Invent Clock (ζ Challenge)

**Short answer: matched invent — FractiSI (no cutoff) vs no-FractiSI (180 s cutoff), both Challenge-only, no sealed Anthropic corpus.** This VM has **no** Anthropic/OpenAI/HF keys, so both arms invent with Lean/Mathlib tactics only. Results: FractiSI **30.20 s** → plateau **0/17** closed · **17** sorries; no-FractiSI **34.12 s** → plateau **0/17** closed · **17** sorries (180 s budget unused — strategies exhausted). Neither arm is a win vs Anthropic ~**1.5 days** invent+formalize. RH remains **OPEN**.

**Document ID:** `WP-RIEMANN-FRACTISI-EXPEDITION-EGS-2026-11-24`  
**Invent harness (FractiSI, no cutoff):** `lean/timing/run-zeta23-invent.mjs`  
**Invent harness (no-kit, 180 s):** `lean/timing/run-zeta23-invent-no-kit.mjs`  
**Receipts:** `…-invent-latest.json` · `…-invent-no-kit-latest.json`

## Matched invent table

| Arm | Cutoff | Wall clock | Closed | Sorries | FractiSI | Sealed corpus | LLM |
|---|---|---|---|---|---|---|---|
| **FractiSI invent** | **none** | **30.20 s** (plateau) | **0 / 17** | **17** | yes | no | no |
| **No-FractiSI invent** | **180 s** | **34.12 s** (plateau) | **0 / 17** | **17** | no | no | no |
| Anthropic published | ~1.5 days | ~1.5 days | green formalization | — | no | N/A (they wrote it) | yes |

## Invented vs reused

| | Status |
|---|---|
| Analytic argument (Alpöge–Furman) | **Not invented** on this VM |
| Tactic invent attempts | Both arms — **none closed** |
| Mathlib + ChallengeDeps/Challenge | **Reused** trusted surface |
| Anthropic Zeta23 proof library | **Forbidden** (not used) |

## Protocol

```text
FractiSI arm = Challenge-only → FractiSI agents invent Solution (no cutoff) → plateau/green
no-kit arm   = Challenge-only → sequential tactic invent → 180s cutoff or plateau
forbid       = sealed Anthropic corpus; import Zeta23
```

Schemas: `zeta23-invent.v1` · `zeta23-invent-no-kit.v1`

## Reproduce

```bash
export PATH="$HOME/.elan/bin:$PATH"
cd expeditions/riemann-fractisi/lean
node timing/run-zeta23-invent.mjs --no-cutoff
node timing/run-zeta23-invent-no-kit.mjs --cutoff-seconds 180
```
