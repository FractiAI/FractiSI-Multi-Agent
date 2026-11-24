# Riemann Expedition · Lean scaffold

Minimal **Lean 4** / **Lake** project for the FractiSI multi-agent Riemann-adjacent formalization expedition.

## Honesty (read first)

- This scaffold does **not** prove the Riemann hypothesis.
- RH remains **open** here. See `RiemannExpedition/Honesty.lean`.
- Anthropic’s public Riemann work (2026-08-10) improved a **lower bound** on the fraction of zeta zeros on the critical line (41.6% → 67.2%); it did **not** resolve RH:  
  https://www.anthropic.com/research/riemann-zeta
- The ~**30 hour** multi-agent baseline cited in the expedition plan is Anthropic’s **Fermat’s Last Theorem Lean formalization** with ~1,000 Fable 5.2 agents (~28.7–30 h), not an RH proof:  
  https://www.anthropic.com/claude-fable-and-mythos-5-2 · https://www.anthropic.com/research/formalizing-fermats-last-theorem

## What “passes formal proof” means here

| Gate | Meaning |
|------|---------|
| Phase 0 pass | `lake build` succeeds; Phase-0 modules contain **no** `sorry`; RH unproved |
| Phase-N progress | Replace `True` slots in `PhaseN.lean` with real statements + proofs; no `sorry` on merge |
| Expedition success (plan) | Timed multi-agent run emits a JSON receipt; Lean gate green for claimed phase; **no RH-solved claim** |

## Requirements

- [elan](https://github.com/leanprover/elan) (Lean version manager)
- Toolchain pinned in `lean-toolchain`: `leanprover/lean4:v4.14.0`
- **No Mathlib** in Phase 0 (keeps first build minutes-scale)

```bash
# install elan once (example)
curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh
source "$HOME/.elan/env"
```

## Build / check

```bash
cd docs/riemann-lean   # or this directory’s absolute path
lake build
# Prefer the harness (handles noexec / non-+x mounts by staging under /tmp):
node timing/run-expedition.mjs --phase 0
# Or:
lake exe riemann-check
```

Expected check output includes:

- `riemann-expedition · scaffold OK`
- `RH claim status: OPEN — …`

## Layout

```
riemann-lean/
  lakefile.lean
  lean-toolchain
  Main.lean                 # thin status executable
  RiemannExpedition.lean    # library root
  RiemannExpedition/
    Honesty.lean            # machine-readable non-claims
    CriticalLine.lean       # Nat model of Re(s)=1/2
    ProportionLadder.lean   # 33.3% / 41.6% / 67.2% millesimal facts
    Phase0.lean             # must stay sorry-free
    PhaseN.lean             # deferred literature slots (True placeholders)
  timing/                   # wall-clock harness + receipt writer
  receipts/                 # JSON timing receipts (gitignored optional)
```

## Timing harness

```bash
node timing/run-expedition.mjs
# or
./timing/run-expedition.sh
```

Writes a receipt under `receipts/` (path also printed). See the expedition plan for comparison protocol vs the ~30 h Anthropic FLT formalization baseline.

## FractiSI kit hooks

When this tree sits beside a FractiSI-Multi-Agent checkout:

```bash
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs init
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs agents register lead cursor
# …
```

The harness accepts `--tiny <path-to-tiny.mjs>` and records whether the kit CLI was invoked. Coordination patterns (shared world once, per-agent deltas, selective reconstruct) are prescribed in the plan; this scaffold is the Lean / timing surface.
