from typing import Any

import pytest

from tiny_footprint_labs.llm.kv import (
    kv_bytes_per_token,
    kv_pairs,
    logical_bytes,
    shared_prefix_reduction,
    slice_suffix,
)


def test_the_formula() -> None:
    assert kv_bytes_per_token(layers=6, heads=12, head_dim=64, dtype_bytes=4) == 2 * 6 * 12 * 64 * 4


def test_the_predicted_reduction_is_the_saturation_formula() -> None:
    sessions, prefix, suffix = 8, 512, 21
    shared_fraction = prefix / (prefix + suffix)
    assert shared_prefix_reduction(sessions, prefix, suffix) == pytest.approx(shared_fraction * (1 - 1 / sessions))
    assert shared_prefix_reduction(1, 100, 10) == pytest.approx(0)


def test_tensor_helpers_with_real_tensors() -> None:
    torch = pytest.importorskip("torch")
    key = torch.arange(24, dtype=torch.float32).reshape(1, 2, 4, 3)
    pairs = [(key, key.clone())]
    assert logical_bytes(pairs) == 2 * 24 * 4
    sliced = slice_suffix(pairs, prefix_tokens=3)
    assert sliced[0][0].shape == (1, 2, 1, 3)
    assert not torch.shares_memory(sliced[0][0], key) if hasattr(torch, "shares_memory") else True
    sliced[0][0][0, 0, 0, 0] = -1
    assert key[0, 0, 3, 0] != -1


def test_all_cache_shapes_read_the_same(tiny_model: Any) -> None:
    torch = pytest.importorskip("torch")
    output = tiny_model(input_ids=torch.tensor([[1, 2, 3]]), use_cache=True)
    pairs = kv_pairs(output.past_key_values)
    assert len(pairs) == tiny_model.config.n_layer
    assert pairs[0][0].shape[2] == 3
    assert kv_pairs(tuple(pairs))[0][0] is pairs[0][0]

    class KeyValueCache:
        key_cache = [pairs[0][0]]
        value_cache = [pairs[0][1]]

    assert kv_pairs(KeyValueCache())[0][1] is pairs[0][1]
