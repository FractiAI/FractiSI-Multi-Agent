from typing import Any

import pytest

from tiny_footprint_labs.llm.inference import (
    RHYME_SLOT_EVERY,
    check_equivalence,
    greedy_decode,
    measure_rhyme_sharing,
    measure_timing,
    rhyming_prefix,
    run_forward,
)
from tiny_footprint_labs.llm.kv import kv_pairs


def _ids(*values: int) -> Any:
    torch = pytest.importorskip("torch")
    return torch.tensor([list(values)])


def test_reusing_a_prefix_gives_the_same_logits_and_tokens(tiny_model: Any) -> None:
    prefix, suffixes = _ids(1, 2, 3, 4, 5, 6), [_ids(7, 8), _ids(9, 10)]
    result = check_equivalence(tiny_model, prefix, suffixes, new_tokens=4, tolerance=1e-4)
    assert result["equivalent"] is True
    assert result["tokenSequencesEqual"] == 2
    assert result["worstLogitAbsDifference"] < 1e-4


def test_the_receipt_says_whether_the_check_can_see_a_wrong_cache(tiny_model: Any) -> None:
    prefix, suffixes = _ids(1, 2, 3, 4, 5, 6), [_ids(7, 8), _ids(9, 10)]
    control = check_equivalence(tiny_model, prefix, suffixes, new_tokens=4, tolerance=1e-4)["control"]
    assert control["detected"] is True
    assert control["worstLogitAbsDifference"] > 1e-4
    assert "reverse" in control["kind"]


def test_negative_control_a_check_too_loose_to_see_anything_says_so(tiny_model: Any) -> None:
    prefix, suffixes = _ids(1, 2, 3, 4, 5, 6), [_ids(7, 8)]
    control = check_equivalence(tiny_model, prefix, suffixes, new_tokens=0, tolerance=1e9)["control"]
    assert control["detected"] is False


def test_negative_control_a_wrong_prefix_is_detected(tiny_model: Any) -> None:
    torch = pytest.importorskip("torch")
    suffix = _ids(7, 8)
    full = torch.cat([_ids(1, 2, 3, 4), suffix], dim=1)
    wrong_prefix = kv_pairs(run_forward(tiny_model, _ids(4, 3, 2, 1), None).past_key_values)
    difference = (
        (
            run_forward(tiny_model, full, None).logits[:, -1, :]
            - run_forward(tiny_model, suffix, wrong_prefix).logits[:, -1, :]
        )
        .abs()
        .max()
        .item()
    )
    assert difference > 1e-4


def test_shared_prefix_tensors_are_not_modified_by_use(tiny_model: Any) -> None:
    pairs = kv_pairs(run_forward(tiny_model, _ids(1, 2, 3), None).past_key_values)
    snapshot = pairs[0][0].clone()
    run_forward(tiny_model, _ids(4, 5), pairs)
    run_forward(tiny_model, _ids(6, 7), pairs)
    assert pairs[0][0].equal(snapshot)
    assert pairs[0][0].shape[2] == 3


def test_greedy_decode_yields_the_requested_tokens(tiny_model: Any) -> None:
    tokens = greedy_decode(tiny_model, run_forward(tiny_model, _ids(1, 2), None), 5)
    assert len(tokens) == 5
    assert all(isinstance(token, int) for token in tokens)


def test_timing_reports_both_arms_and_keeps_raw_samples(tiny_model: Any) -> None:
    suffixes = [_ids(7, 8), _ids(9, 10)]
    result = measure_timing(tiny_model, "cpu", _ids(1, 2, 3, 4), suffixes, new_tokens=2, trials=2, warmup=1, seed=1)
    for arm in ("withoutTinyFootprint", "withTinyFootprint"):
        assert len(result[arm]["prefillCallSamplesMs"]) == 2 * 2
        assert len(result[arm]["prefillBatchSamplesMs"]) == 2
        assert result[arm]["prefillCallMs"]["n"] == 4
    assert result["prefixPrefillMs"]["n"] == 2
    assert result["comparison"]["prefillP50Speedup"] > 0


def test_a_rhyming_prefix_changes_only_its_slots() -> None:
    prefix = _ids(*range(1, 18))
    changed = rhyming_prefix(prefix)
    assert changed.shape == prefix.shape
    assert int((changed != prefix).sum()) == len(range(0, 17, RHYME_SLOT_EVERY))
    assert int(prefix[0, 1]) == int(changed[0, 0])


def test_rhyme_sharing_reports_what_repeats_and_what_a_resume_would_do(tiny_model: Any) -> None:
    prefix, suffixes = _ids(*range(1, 18)), [_ids(30, 31), _ids(40, 41)]
    report = measure_rhyme_sharing(tiny_model, prefix, suffixes, new_tokens=2, tolerance=1e-4)
    assert report["positions"] == 17
    assert report["changedTokens"] == 3
    assert report["layers"] == len(report["matchingPositionsByLayer"])
    assert 0 <= report["matchingCellFraction"] < 1
    assert report["resumeFromRhymingCache"]["turns"] == 2


def test_only_the_first_layer_repeats_at_unchanged_positions(tiny_model: Any) -> None:
    prefix, suffixes = _ids(*range(1, 18)), [_ids(30, 31)]
    report = measure_rhyme_sharing(tiny_model, prefix, suffixes, new_tokens=2, tolerance=1e-4)
    first, *later = report["matchingPositionsByLayer"]
    assert first == report["positions"] - report["changedTokens"]
    assert all(count < first for count in later)


def test_negative_control_identical_prompts_share_every_cell(tiny_model: Any) -> None:
    prefix, suffixes = _ids(*range(1, 18)), [_ids(30, 31)]
    report = measure_rhyme_sharing(tiny_model, prefix, suffixes, new_tokens=2, tolerance=1e-4, rhyme_ids=prefix.clone())
    assert report["changedTokens"] == 0
    assert report["matchingCellFraction"] == 1
    assert report["resumeFromRhymingCache"]["equivalent"] is True
