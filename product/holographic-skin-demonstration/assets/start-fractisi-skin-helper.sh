#!/usr/bin/env bash
# Double-click / run once: installs (if needed) and starts the Soft Story helper.
set -euo pipefail
CFG="${HOME}/.config/fractisi-skin/helper.json"

start_from_cfg() {
  NODE=$(python3 -c "import json;print(json.load(open('$CFG'))['node'])" 2>/dev/null || true)
  SCRIPT=$(python3 -c "import json;print(json.load(open('$CFG'))['script'])" 2>/dev/null || true)
  ROOT=$(python3 -c "import json;print(json.load(open('$CFG'))['root'])" 2>/dev/null || true)
  if [[ -n "${NODE:-}" && -x "$NODE" && -f "${SCRIPT:-}" ]]; then
    echo "Starting FractiSI Soft Story helper…"
    nohup "$NODE" "$SCRIPT" --companion-only --no-open >/dev/null 2>&1 &
    echo "Helper started."
    exit 0
  fi
}

if [[ -f "$CFG" ]]; then
  start_from_cfg
fi

# Search common clone locations, then install + start
CANDIDATES=(
  "$HOME/FractiSI-Multi-Agent"
  "$HOME/repos/FractiSI-Multi-Agent"
  "$HOME/code/FractiSI-Multi-Agent"
  "$HOME/src/FractiSI-Multi-Agent"
  "$HOME/Projects/FractiSI-Multi-Agent"
  "$HOME/Developer/FractiSI-Multi-Agent"
  "/agent/repos/FractiSI-Multi-Agent"
)

for d in "${CANDIDATES[@]}"; do
  if [[ -f "$d/scripts/holographic-auto-session.mjs" ]]; then
    echo "Found repo at $d — installing auto-start…"
    (cd "$d" && npm run skin:auto-session:install)
    exit 0
  fi
done

echo "Could not find FractiSI-Multi-Agent."
echo "Open a terminal in your FractiSI-Multi-Agent clone and run:"
echo "  npm run skin:auto-session:install"
exit 1
