from tiny_footprint_labs.common.stats import ratio, summarize_ms


def test_odd_and_even_medians() -> None:
    assert summarize_ms([3.0, 1.0, 2.0])["p50Ms"] == 2.0
    assert summarize_ms([1.0, 2.0, 3.0, 4.0])["p50Ms"] == 2.5


def test_summary_fields() -> None:
    summary = summarize_ms([1.0, 3.0])
    assert summary["n"] == 2
    assert summary["meanMs"] == 2.0
    assert summary["minMs"] == 1.0
    assert summary["maxMs"] == 3.0


def test_an_empty_sample_is_distinct_from_zero() -> None:
    assert summarize_ms([]) == {"n": 0, "meanMs": None, "p50Ms": None, "p95Ms": None, "minMs": None, "maxMs": None}


def test_ratio_handles_unavailable_sides() -> None:
    assert ratio(4.0, 2.0) == 2.0
    assert ratio(None, 2.0) is None
    assert ratio(1.0, None) is None
    assert ratio(1.0, 0.0) is None
