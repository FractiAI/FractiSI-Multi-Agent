import json
from pathlib import Path

from tiny_footprint_labs.h100.roofline import (
    LLAMA2_7B,
    ORG_TOKENS,
    RHYME_SHARED_ORG_FRACTION,
    SESSIONS,
    SUFFIX_TOKENS,
    build_report,
    copy_seconds,
    kv_bytes_per_token,
    resident,
)


def test_the_report_equals_the_receipt_committed_before_modularization(historical: Path) -> None:
    assert build_report() == json.loads((historical / "h100_prefix_cache_sim.json").read_text(encoding="utf-8"))


def test_it_labels_itself_a_simulation() -> None:
    report = build_report()
    assert report["kind"] == "simulation"
    assert report["notAMeasurement"] is True
    assert report["comparison"]["peakBandwidthIsAnUpperBound"] is True


def test_with_an_exact_prefix_tiny_footprint_holds_the_same_memory_as_a_prefix_cache() -> None:
    assert build_report()["workloads"]["identicalPrefix"]["comparison"]["tinyVersusPrefixCacheResidentBytes"] == 0


def test_the_accounting() -> None:
    per_token = kv_bytes_per_token(LLAMA2_7B)
    assert per_token == 2 * 32 * 32 * 128 * 2
    arms = build_report()["workloads"]["identicalPrefix"]["arms"]
    assert arms["naiveRefill"]["kvBytes"] == SESSIONS * (ORG_TOKENS + SUFFIX_TOKENS) * per_token
    assert arms["productionPrefixCache"]["kvBytes"] == (ORG_TOKENS + SESSIONS * SUFFIX_TOKENS) * per_token
    assert resident(LLAMA2_7B, 0) == LLAMA2_7B["parameters"] * LLAMA2_7B["dtypeBytes"]
    assert copy_seconds(100, 50.0) == 2.0


def test_the_rhyme_saving_is_the_json_fraction_it_was_given() -> None:
    rhyming = build_report()["workloads"]["rhymingDifferentWording"]
    template = rhyming["arms"]["tinyFootprintRhyme"]["templateOrgTokens"]
    assert template == round(ORG_TOKENS * RHYME_SHARED_ORG_FRACTION)
    per_token = kv_bytes_per_token(LLAMA2_7B)
    kept = (template + SESSIONS * (ORG_TOKENS - template + SUFFIX_TOKENS)) * per_token
    assert rhyming["arms"]["tinyFootprintRhyme"]["kvBytes"] == kept


def test_negative_control_the_rhyme_workloads_equivalence_only_compares_lengths() -> None:
    equivalence = build_report()["workloads"]["rhymingDifferentWording"]["outputEquivalence"]
    assert "length" in equivalence["checked"]
    assert equivalence["notGeneratedText"] is True
