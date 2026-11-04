#!/usr/bin/env python3
"""Thin orchestrator: the name the template's render stage looks for. Hydration lives in Node."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


def main() -> int:
    node = shutil.which("node")
    if node is None:
        print("node is required to hydrate this manuscript", file=sys.stderr)
        return 1
    script = Path(__file__).with_suffix(".mjs")
    return subprocess.run([node, str(script)], check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
