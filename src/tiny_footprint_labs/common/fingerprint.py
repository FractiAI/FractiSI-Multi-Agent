"""Source fingerprints, computed exactly as ``src/benchmarks/fingerprint.mjs`` computes them.

Verification recomputes a receipt's fingerprint in Node, so any difference between
the two implementations fails the build rather than going unnoticed.
"""

from __future__ import annotations

import hashlib
from collections.abc import Sequence
from pathlib import Path
from typing import Any

SOURCE_SUFFIXES = (".mjs", ".json", ".py")


def sha256_hex(data: bytes) -> str:
    """Lowercase hexadecimal SHA-256 of ``data``."""
    return hashlib.sha256(data).hexdigest()


def _list_files(repo_root: Path, entry: str) -> list[str]:
    absolute = repo_root / entry
    if absolute.is_file():
        return [entry]
    files: list[str] = []
    for item in absolute.iterdir():
        child = f"{entry}/{item.name}"
        if item.is_dir():
            if not item.name.startswith("."):
                files.extend(_list_files(repo_root, child))
        elif item.suffix in SOURCE_SUFFIXES:
            files.append(child)
    return files


def source_fingerprint(repo_root: Path, roots: Sequence[str]) -> dict[str, Any]:
    """Hash the sorted list of per-file hashes under ``roots``, which are repo-relative."""
    files = sorted(file for entry in roots for file in _list_files(repo_root, entry))
    manifest = "\n".join(f"{sha256_hex((repo_root / file).read_bytes())}  {file}" for file in files)
    return {
        "algorithm": "sha256-of-sorted-file-hashes",
        "fileCount": len(files),
        "sha256": sha256_hex(manifest.encode("utf-8")),
    }
