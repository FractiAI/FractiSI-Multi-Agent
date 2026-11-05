# CLI

The `tiny` command. [`scripts/tiny.mjs`](../../scripts/tiny.mjs) is its entry point, and [the reference](../../docs/reference/cli.md) documents it.

## Contents

| Path | What it is |
|---|---|
| [`commands/`](commands/README.md) | One module per command |
| [`context.mjs`](context.mjs) | Shared command context: configuration, paths, logging and small helpers. |
| [`main.mjs`](main.mjs) | Tiny Footprint Workstation CLI dispatch. |
| [`prompt.mjs`](prompt.mjs) | Interactive question helper for `join` and `share`. |
