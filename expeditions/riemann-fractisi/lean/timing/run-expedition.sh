#!/usr/bin/env bash
# Thin shell wrapper around run-expedition.mjs
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$ROOT/timing/run-expedition.mjs" "$@"
