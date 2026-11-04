# Conventions

**Logic lives in `src/`.** Files in `scripts/` are entry points: parse arguments, call one function, print. A gate limits their length and function count. If a script needs a helper, that helper belongs in `src/` with a test.

**Tests mirror source.** See [testing](testing.md).

**One canonical home.** Old paths under `research/` and `tiny-footprint/sdk/` only re-export, which a gate enforces. Extend the module in `src/`.

**Evidence is generated.** Nothing under `output/` is edited by hand, nor is `docs/benchmarks/RESULTS.md` or the generated block in the README. Fix the producer and regenerate.

**A study value in a manuscript is a token.** See [the syntax guide](../manuscript/SYNTAX.md). The gate catches numbers typed into authored sections.

**Absent is not zero.** A lab that did not run reports `not_run`. A backend with no allocator reads `null` and displays `n/a`. Evidence readers throw on a missing file instead of returning an empty record: `readOptionalJson` is only for optional configuration.

**Seed everything.** Randomness comes from an explicit `mulberry32(seed)` in Node or `random.Random(seed)` in Python. Results and figures carry no timestamps. Receipts that describe a run carry them in one known place.

**Name the tier.** A figure, table or doc that states a number says whether it is deterministic, measured, simulated or historical.

**Every folder has a `README.md` for people and an `AGENTS.md` for agents.** A gate enforces it. See [writing folder guides](#writing-folder-guides).

**Style.** Node code is ESM with `.mjs`, targets Node 18, and has no runtime dependencies. Modules under `src/` use kebab-case filenames. Pipeline entry points in `scripts/` use snake_case, like the template's stages. Python is checked with `ruff` and `mypy` under `uv`, with snake_case filenames, and imports heavy dependencies inside the functions that need them, so the package stays importable without them.

## Writing folder guides

A `README.md` tells a person what the folder is and what is in it. An `AGENTS.md` holds what an agent cannot discover by looking: the invariant, the reason behind a rule, the trap. Leave out anything a directory listing or `--help` already says. Prefer stating what to do over what to avoid.
