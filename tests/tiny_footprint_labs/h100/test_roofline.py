import json
from pathlib import Path

from tiny_footprint_labs.h100.roofline import (
    LLAMA2_7B,
    PREFIX_TOKENS,
    SESSIONS,
    SUFFIX_TOKENS,
    build_report,
    copy_seconds,
    kv_bytes_per_token,
    reconstruct,
    resident,
)


def test_the_report_equals_the_receipt_committed_before_modularization(historical: Path) -> None:
    assert build_report() == json.loads((historical / "h100_prefix_cache_sim.json").read_text(encoding="utf-8"))


def test_it_labels_itself_a_simulation() -> None:
    report = build_report()
    assert report["kind"] == "simulation"
    assert report["notAMeasurement"] is True
    assert report["comparison"]["peakBandwidthIsAnUpperBound"] is True


def test_tiny_footprint_has_no_memory_advantage_over_a_prefix_cache_here() -> None:
    assert build_report()["comparison"]["tinyVersusPrefixCacheResidentBytes"] == 0


def test_the_accounting() -> None:
    per_token = kv_bytes_per_token(LLAMA2_7B)
    assert per_token == 2 * 32 * 32 * 128 * 2
    report = build_report()
    assert report["arms"]["naiveRefill"]["kvBytes"] == SESSIONS * (PREFIX_TOKENS + SUFFIX_TOKENS) * per_token
    assert report["arms"]["productionPrefixCache"]["kvBytes"] == (PREFIX_TOKENS + SESSIONS * SUFFIX_TOKENS) * per_token
    assert resident(LLAMA2_7B, 0) == LLAMA2_7B["parameters"] * LLAMA2_7B["dtypeBytes"]
    assert copy_seconds(100, 50.0) == 2.0


def test_weights_dilute_the_saving() -> None:
    comparison = build_report()["comparison"]
    assert comparison["residentReductionVersusNaive"] < comparison["kvReductionVersusNaive"]


def test_reconstruct_is_concatenation() -> None:
    assert reconstruct([1, 2], [3]) == [1, 2, 3]
