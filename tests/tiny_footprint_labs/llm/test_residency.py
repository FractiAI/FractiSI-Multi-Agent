from typing import Any

import pytest

from tiny_footprint_labs.llm.residency import measure_residency


def _ids(*values: int) -> Any:
    torch = pytest.importorskip("torch")
    return torch.tensor([list(values)])


def test_tensors_match_the_formula_exactly_and_concatenation_is_faithful(tiny_model: Any) -> None:
    prefix = _ids(*range(1, 21))
    suffixes = [_ids(21, 22, 23), _ids(24, 25, 26), _ids(27, 28, 29)]
    result = measure_residency(tiny_model, "cpu", prefix, suffixes, dtype_bytes=4, materialize_trials=2)
    assert result["duplicated"]["logicalBytes"] == result["duplicated"]["formulaBytes"]
    assert result["shared"]["logicalBytes"] == result["shared"]["formulaBytes"]
    assert result["reduction"]["logical"] == pytest.approx(result["reduction"]["predicted"])
    assert result["concatWorstAbsDifference"] < 1e-4
    assert result["materializeMs"]["n"] == 2


def test_cpu_has_no_allocator_reading_and_that_stays_absent(tiny_model: Any) -> None:
    result = measure_residency(
        tiny_model, "cpu", _ids(1, 2, 3, 4), [_ids(5), _ids(6)], dtype_bytes=4, materialize_trials=1
    )
    assert result["duplicated"]["deviceAllocatedBytes"] is None
    assert result["shared"]["deviceAllocatedBytes"] is None
    assert result["reduction"]["device"] is None
