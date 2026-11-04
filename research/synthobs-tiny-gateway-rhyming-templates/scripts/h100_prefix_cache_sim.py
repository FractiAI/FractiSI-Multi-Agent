#!/usr/bin/env python3
"""KV-cache residency roofline for the named H100 SXM 80GB profile.

This script models a prefix cache, not a rhyme. A rhyme matches organization
rather than identical text; that comparison is rhyme_vs_cache_sim.mjs.

This is a simulation. It does not touch a GPU. Device capacity and peak
bandwidth are NVIDIA's published H100 SXM specifications. The byte formula is
the standard transformer KV-cache size (two tensors, layers, KV heads, head
dim, dtype), the same accounting used by paged-attention serving work.

Three arms, same Llama-2-7B-shaped model and the same 16 sessions:

- naive: every session stores a full prefix plus its own suffix (the laptop
  lab's re-prefill baseline)
- prefix cache: the shared prefix is stored once, then each session stores
  only its suffix (a production server that already caches prefixes)
- tiny footprint: the shared template is stored once as that same KV, then
  each session stores only its suffix

Output equivalence here means the reconstructed token ids equal the original
ids. It is not a check of generated text.
"""

from __future__ import annotations

import json
from pathlib import Path

# NVIDIA H100 SXM product specification. Not a measurement from this machine.
H100_SXM = {
    "name": "NVIDIA H100 SXM 80GB",
    "memoryClass": "HBM3",
    "capacityBytes": 80 * (1024**3),
    "peakBandwidthBytesPerSec": 3.35e12,
    "source": "NVIDIA H100 Tensor Core GPU datasheet: 80 GB HBM3, 3.35 TB/s",
}

# Public Llama-2-7B shape. bf16 weights and KV.
LLAMA2_7B = {
    "id": "meta-llama/Llama-2-7b-hf",
    "parameters": 6_738_415_616,
    "layers": 32,
    "kvHeads": 32,
    "headDim": 128,
    "dtypeBytes": 2,
}

PREFIX_TOKENS = 2048
SUFFIX_TOKENS = 128
SESSIONS = 16


def kv_bytes_per_token(model: dict) -> int:
    return 2 * model["layers"] * model["kvHeads"] * model["headDim"] * model["dtypeBytes"]


def resident(model: dict, kv_bytes: int) -> int:
    return model["parameters"] * model["dtypeBytes"] + kv_bytes


def copy_seconds(nbytes: int, bandwidth: float) -> float:
    return nbytes / bandwidth


def reconstruct(prefix: list[int], suffix: list[int]) -> list[int]:
    return prefix + suffix


def main() -> None:
    model = LLAMA2_7B
    device = H100_SXM
    per_token = kv_bytes_per_token(model)
    weights = model["parameters"] * model["dtypeBytes"]

    prefix = list(range(PREFIX_TOKENS))
    suffixes = [list(range(10_000 + i * SUFFIX_TOKENS, 10_000 + (i + 1) * SUFFIX_TOKENS)) for i in range(SESSIONS)]
    originals = [prefix + suffix for suffix in suffixes]
    rebuilt = [reconstruct(prefix, suffix) for suffix in suffixes]
    equivalent = rebuilt == originals

    naive_kv = SESSIONS * (PREFIX_TOKENS + SUFFIX_TOKENS) * per_token
    shared_kv = (PREFIX_TOKENS + SESSIONS * SUFFIX_TOKENS) * per_token

    arms = {
        "naiveRefill": {
            "kvBytes": naive_kv,
            "residentBytes": resident(model, naive_kv),
            "materializeBytes": naive_kv,
        },
        "productionPrefixCache": {
            "kvBytes": shared_kv,
            "residentBytes": resident(model, shared_kv),
            "materializeBytes": shared_kv,
        },
        "tinyFootprint": {
            "kvBytes": shared_kv,
            "residentBytes": resident(model, shared_kv),
            "materializeBytes": shared_kv,
            "sameResidentSetAsPrefixCache": True,
        },
    }
    for arm in arms.values():
        arm["fits"] = arm["residentBytes"] <= device["capacityBytes"]
        arm["materializeSecondsAtPeak"] = copy_seconds(arm["materializeBytes"], device["peakBandwidthBytesPerSec"])

    naive = arms["naiveRefill"]
    shared = arms["productionPrefixCache"]
    report = {
        "ok": True,
        "kind": "simulation",
        "simulator": "kv-cache residency roofline",
        "notAMeasurement": True,
        "device": device,
        "model": model,
        "workload": {
            "prefixTokens": PREFIX_TOKENS,
            "suffixTokens": SUFFIX_TOKENS,
            "sessions": SESSIONS,
            "kvBytesPerToken": per_token,
            "weightBytes": weights,
        },
        "outputEquivalence": {
            "checked": "reconstructed token ids equal the original ids",
            "equivalent": equivalent,
            "sessions": SESSIONS,
            "notGeneratedText": True,
        },
        "arms": arms,
        "comparison": {
            "kvReductionVersusNaive": (naive["kvBytes"] - shared["kvBytes"]) / naive["kvBytes"],
            "residentReductionVersusNaive": (naive["residentBytes"] - shared["residentBytes"]) / naive["residentBytes"],
            "tinyVersusPrefixCacheResidentBytes": arms["tinyFootprint"]["residentBytes"] - shared["residentBytes"],
            "peakBandwidthIsAnUpperBound": True,
        },
        "honesty": (
            "Simulation on a published H100 SXM profile. Peak-bandwidth copy time is an upper bound, "
            "not a predicted wall clock. Tiny Footprint is given the same resident KV as a production "
            "prefix cache, because this lab has not measured a KV compression factor. The in-process "
            "84.5% representation cut is not applied to device memory."
        ),
    }
    out = Path(__file__).resolve().parents[1] / "data" / "h100_prefix_cache_sim.json"
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if not equivalent:
        raise SystemExit("reconstructed token ids did not match")
    print(json.dumps({"wrote": str(out), "equivalent": equivalent, "kvReductionVersusNaive": report["comparison"]["kvReductionVersusNaive"], "tinyVersusPrefixCacheResidentBytes": report["comparison"]["tinyVersusPrefixCacheResidentBytes"]}, indent=2))


if __name__ == "__main__":
    main()
