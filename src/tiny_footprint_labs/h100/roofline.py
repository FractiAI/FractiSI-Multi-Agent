"""H100 SXM residency roofline: rhyme versus a production prefix cache.

This is a simulation. It does not touch a GPU. Device capacity and peak bandwidth are
NVIDIA's published H100 SXM specifications. The byte formula is the standard transformer
KV-cache size (two tensors, layers, KV heads, head dim, dtype).

Two workloads, same Llama-2-7B shape:

- identicalPrefix: every session shares one exact token prefix. A production prefix
  cache and Tiny Footprint store it once, so the two arms hold the same resident set.
- rhymingDifferentWording: sessions share organizational slots with different tokens, so
  a prefix cache cannot share. The Tiny Footprint arm stores one template KV plus deltas,
  in the proportion a JSON record splits into template and delta.

The second workload is a hypothesis about KV memory, not a measurement of it. Its
equivalence check compares lengths, because the rebuilt token ids differ from the
originals by construction, so it cannot fail. `tiny_footprint_labs.llm.inference` tests
the premise on real tensors.
"""

from __future__ import annotations

from typing import Any

# NVIDIA H100 SXM product specification. Not a measurement from this machine.
H100_SXM: dict[str, Any] = {
    "name": "NVIDIA H100 SXM 80GB",
    "memoryClass": "HBM3",
    "capacityBytes": 80 * (1024**3),
    "peakBandwidthBytesPerSec": 3.35e12,
    "source": "NVIDIA H100 Tensor Core GPU datasheet: 80 GB HBM3, 3.35 TB/s",
}

# Public Llama-2-7B shape. bf16 weights and KV.
LLAMA2_7B: dict[str, Any] = {
    "id": "meta-llama/Llama-2-7b-hf",
    "parameters": 6_738_415_616,
    "layers": 32,
    "kvHeads": 32,
    "headDim": 128,
    "dtypeBytes": 2,
}

ORG_TOKENS = 2048
SUFFIX_TOKENS = 128
SESSIONS = 16

# Measured from research/.../src/rhyme-vs-cache.mjs differing-word cohort:
# oneFull=198 B, oneDelta=121 B → sharedFraction = 1 - 121/198.
# Locked by assertH100RhymeSimInvariants in src/experiments/s-h100-rhyme-sim.mjs.
RHYME_SHARED_ORG_FRACTION = 1.0 - (121.0 / 198.0)
RHYME_DELTA_ORG_FRACTION = 121.0 / 198.0
RHYME_SHARE_SOURCE = (
    "in-process Rhyming Template encode on 40 differing-word sessions "
    "(shared fields stay in template; differing fields become nested deltas). "
    "Applied here as an organizational KV residency hypothesis — "
    "not a measured transformer KV-cache compression factor on H100."
)


def kv_bytes_per_token(model: dict[str, Any]) -> int:
    return 2 * model["layers"] * model["kvHeads"] * model["headDim"] * model["dtypeBytes"]


def resident(model: dict[str, Any], kv_bytes: int) -> int:
    return model["parameters"] * model["dtypeBytes"] + kv_bytes


def copy_seconds(nbytes: int, bandwidth: float) -> float:
    return nbytes / bandwidth


def finish_arm(arm: dict[str, Any], model: dict[str, Any], device: dict[str, Any]) -> dict[str, Any]:
    arm = dict(arm)
    arm["residentBytes"] = resident(model, arm["kvBytes"])
    arm["fits"] = arm["residentBytes"] <= device["capacityBytes"]
    arm["materializeSecondsAtPeak"] = copy_seconds(
        arm["materializeBytes"], device["peakBandwidthBytesPerSec"]
    )
    return arm


def identical_prefix_workload(model: dict[str, Any], device: dict[str, Any], per_token: int) -> dict[str, Any]:
    """Exact shared prefix — prefix cache and Tiny Footprint match."""
    prefix_tokens = list(range(ORG_TOKENS))
    suffixes = [
        list(range(10_000 + i * SUFFIX_TOKENS, 10_000 + (i + 1) * SUFFIX_TOKENS))
        for i in range(SESSIONS)
    ]
    originals = [prefix_tokens + suffix for suffix in suffixes]
    rebuilt = [prefix_tokens + suffix for suffix in suffixes]
    equivalent = rebuilt == originals

    naive_kv = SESSIONS * (ORG_TOKENS + SUFFIX_TOKENS) * per_token
    shared_kv = (ORG_TOKENS + SESSIONS * SUFFIX_TOKENS) * per_token

    arms = {
        "naiveRefill": finish_arm(
            {"kvBytes": naive_kv, "materializeBytes": naive_kv}, model, device
        ),
        "productionPrefixCache": finish_arm(
            {
                "kvBytes": shared_kv,
                "materializeBytes": shared_kv,
                "exactPrefixHits": SESSIONS - 1,
            },
            model,
            device,
        ),
        "tinyFootprintRhyme": finish_arm(
            {
                "kvBytes": shared_kv,
                "materializeBytes": shared_kv,
                "note": "Identical exact prefix — Tiny Footprint collapses to prefix-cache residency on this workload.",
                "sameResidentSetAsPrefixCache": True,
            },
            model,
            device,
        ),
    }
    naive = arms["naiveRefill"]
    prefix = arms["productionPrefixCache"]
    tiny = arms["tinyFootprintRhyme"]
    return {
        "id": "identicalPrefix",
        "title": "Identical exact system/org prefix across sessions",
        "rhymeDifferentiates": False,
        "outputEquivalence": {
            "checked": "reconstructed token ids equal the original ids",
            "equivalent": equivalent,
            "sessions": SESSIONS,
            "notGeneratedText": True,
        },
        "arms": arms,
        "comparison": {
            "prefixKvReductionVersusNaive": (naive["kvBytes"] - prefix["kvBytes"]) / naive["kvBytes"],
            "tinyKvReductionVersusNaive": (naive["kvBytes"] - tiny["kvBytes"]) / naive["kvBytes"],
            "tinyKvReductionVersusPrefixCache": (prefix["kvBytes"] - tiny["kvBytes"]) / prefix["kvBytes"],
            "tinyVersusPrefixCacheResidentBytes": tiny["residentBytes"] - prefix["residentBytes"],
            "prefixMaterializeSpeedupVersusNaive": naive["materializeSecondsAtPeak"]
            / prefix["materializeSecondsAtPeak"],
            "tinyMaterializeSpeedupVersusNaive": naive["materializeSecondsAtPeak"]
            / tiny["materializeSecondsAtPeak"],
            "tinyMaterializeSpeedupVersusPrefixCache": prefix["materializeSecondsAtPeak"]
            / tiny["materializeSecondsAtPeak"],
        },
    }


def rhyming_different_wording_workload(model: dict[str, Any], device: dict[str, Any], per_token: int) -> dict[str, Any]:
    """Same organizational slots, different tokens — prefix cache cannot share."""
    # Each session gets a unique org-region token stream (no cross-session exact prefix).
    orgs = [
        list(range(100_000 + i * ORG_TOKENS, 100_000 + (i + 1) * ORG_TOKENS))
        for i in range(SESSIONS)
    ]
    suffixes = [
        list(range(10_000 + i * SUFFIX_TOKENS, 10_000 + (i + 1) * SUFFIX_TOKENS))
        for i in range(SESSIONS)
    ]
    originals = [org + suffix for org, suffix in zip(orgs, suffixes, strict=True)]

    # Tiny Footprint reconstruction: shared organizational template token ids
    # (structural skeleton) + per-session delta org fills + suffix.
    template_org_tokens = max(1, round(ORG_TOKENS * RHYME_SHARED_ORG_FRACTION))
    delta_org_tokens = ORG_TOKENS - template_org_tokens
    assert template_org_tokens + delta_org_tokens == ORG_TOKENS
    template = list(range(50_000, 50_000 + template_org_tokens))
    rebuilt = []
    for i, suffix in enumerate(suffixes):
        delta = list(
            range(
                200_000 + i * delta_org_tokens,
                200_000 + (i + 1) * delta_org_tokens,
            )
        )
        assert len(delta) == delta_org_tokens
        rebuilt_org = template + delta
        assert len(rebuilt_org) == ORG_TOKENS
        rebuilt.append(rebuilt_org + suffix)

    # Token *values* differ from naive originals by construction (template+delta encoding).
    # Equivalence = lossless length / structure and encode round-trip of the rhyme model.
    equivalent_structure = all(
        len(rebuilt[i]) == len(originals[i]) == ORG_TOKENS + SUFFIX_TOKENS for i in range(SESSIONS)
    )
    roundtrip_ok = template_org_tokens + delta_org_tokens + SUFFIX_TOKENS == ORG_TOKENS + SUFFIX_TOKENS

    naive_kv = SESSIONS * (ORG_TOKENS + SUFFIX_TOKENS) * per_token
    # No exact prefix hits ⇒ prefix cache stores every session in full.
    prefix_kv = naive_kv
    tiny_kv = (
        template_org_tokens + SESSIONS * (delta_org_tokens + SUFFIX_TOKENS)
    ) * per_token

    arms = {
        "naiveRefill": finish_arm(
            {"kvBytes": naive_kv, "materializeBytes": naive_kv}, model, device
        ),
        "productionPrefixCache": finish_arm(
            {
                "kvBytes": prefix_kv,
                "materializeBytes": prefix_kv,
                "exactPrefixHits": 0,
                "note": "Different wording in organizational slots — exact-prefix cache cannot share across sessions.",
            },
            model,
            device,
        ),
        "tinyFootprintRhyme": finish_arm(
            {
                "kvBytes": tiny_kv,
                "materializeBytes": tiny_kv,
                "templateOrgTokens": template_org_tokens,
                "deltaOrgTokensPerSession": delta_org_tokens,
                "suffixTokensPerSession": SUFFIX_TOKENS,
                "sharedOrgFraction": RHYME_SHARED_ORG_FRACTION,
                "deltaOrgFraction": RHYME_DELTA_ORG_FRACTION,
                "shareSource": RHYME_SHARE_SOURCE,
                "sameResidentSetAsPrefixCache": False,
            },
            model,
            device,
        ),
    }
    naive = arms["naiveRefill"]
    prefix = arms["productionPrefixCache"]
    tiny = arms["tinyFootprintRhyme"]
    return {
        "id": "rhymingDifferentWording",
        "title": "Same organizational slots, different wording (rhyme differentiates)",
        "rhymeDifferentiates": True,
        "outputEquivalence": {
            "checked": "template+delta encoding preserves org+suffix length; structural round-trip",
            "equivalent": equivalent_structure and roundtrip_ok,
            "sessions": SESSIONS,
            "notGeneratedText": True,
            "note": (
                "Originals use unique org tokens; Tiny rebuilds via shared template + deltas (rhyme model), "
                "not exact-token identity with naive streams."
            ),
        },
        "arms": arms,
        "comparison": {
            "prefixKvReductionVersusNaive": (naive["kvBytes"] - prefix["kvBytes"]) / naive["kvBytes"],
            "tinyKvReductionVersusNaive": (naive["kvBytes"] - tiny["kvBytes"]) / naive["kvBytes"],
            "tinyKvReductionVersusPrefixCache": (prefix["kvBytes"] - tiny["kvBytes"]) / prefix["kvBytes"]
            if prefix["kvBytes"]
            else 0.0,
            "tinyVersusPrefixCacheResidentBytes": tiny["residentBytes"] - prefix["residentBytes"],
            "prefixMaterializeSpeedupVersusNaive": 1.0,
            "tinyMaterializeSpeedupVersusNaive": naive["materializeSecondsAtPeak"]
            / tiny["materializeSecondsAtPeak"],
            "tinyMaterializeSpeedupVersusPrefixCache": prefix["materializeSecondsAtPeak"]
            / tiny["materializeSecondsAtPeak"],
        },
    }


def build_report() -> dict[str, Any]:
    """Compute the roofline report; pure and deterministic."""
    model = LLAMA2_7B
    device = H100_SXM
    per_token = kv_bytes_per_token(model)
    weights = model["parameters"] * model["dtypeBytes"]

    identical = identical_prefix_workload(model, device, per_token)
    rhyming = rhyming_different_wording_workload(model, device, per_token)

    report = {
        "ok": identical["outputEquivalence"]["equivalent"] and rhyming["outputEquivalence"]["equivalent"],
        "kind": "simulation",
        "simulator": "kv-cache residency roofline · rhyme vs prefix cache",
        "notAMeasurement": True,
        "device": device,
        "model": model,
        "workload": {
            "orgTokens": ORG_TOKENS,
            "suffixTokens": SUFFIX_TOKENS,
            "sessions": SESSIONS,
            "kvBytesPerToken": per_token,
            "weightBytes": weights,
            "rhymeSharedOrgFraction": RHYME_SHARED_ORG_FRACTION,
            "rhymeDeltaOrgFraction": RHYME_DELTA_ORG_FRACTION,
            "rhymeShareSource": RHYME_SHARE_SOURCE,
        },
        "workloads": {
            "identicalPrefix": identical,
            "rhymingDifferentWording": rhyming,
        },
        # Back-compat summary: the rhyme-differentiating arm is the headline.
        "arms": rhyming["arms"],
        "comparison": {
            **rhyming["comparison"],
            "identicalPrefixTinyVersusPrefixCacheResidentBytes": identical["comparison"][
                "tinyVersusPrefixCacheResidentBytes"
            ],
            "peakBandwidthIsAnUpperBound": True,
        },
        "honesty": (
            "Simulation on a published H100 SXM profile. Peak-bandwidth copy time is an upper bound, "
            "not a predicted wall clock. On identical exact prefixes, Tiny Footprint matches production "
            "prefix-cache residency. On rhyming organization with different wording, prefix cache cannot "
            "share and Tiny Footprint uses the measured in-process Rhyming Template shared/delta fraction "
            f"({RHYME_SHARED_ORG_FRACTION:.6f} shared org / {RHYME_DELTA_ORG_FRACTION:.6f} delta org) as a "
            "KV residency hypothesis — not a measured H100 transformer KV compression factor, and not the "
            "in-process 84.5% aggregate pasted onto device memory."
        ),
    }
    return report
