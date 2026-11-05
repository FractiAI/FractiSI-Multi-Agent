import json
from pathlib import Path

from tiny_footprint_labs.gpu_live.accounting import MIB, alloc_accounting, delta_bytes, payload_accounting


def test_published_allocation_figures_follow_from_inputs_alone(historical: Path) -> None:
    receipt = json.loads((historical / "gpu_live_chat_hbm_lab.json").read_text(encoding="utf-8"))
    stack = receipt["liveStack"]
    result = alloc_accounting(
        stack["sessions"], stack["kvMibPerSession"], stack["systemPromptMib"], stack["weightStubMib"]
    )
    assert result["conventionalMib"] == receipt["cuMemAlloc"]["conventionalMib"]
    assert result["tinyMib"] == receipt["cuMemAlloc"]["tinyMib"]
    assert result["reductionRatio"] == receipt["cuMemAlloc"]["reductionRatio"]
    assert result["concurrencyDensityGain"] == receipt["strategy"]["concurrencyDensityGain"]


def test_published_copy_payload_follows_from_inputs_alone(historical: Path) -> None:
    receipt = json.loads((historical / "gpu_live_chat_hbm_lab.json").read_text(encoding="utf-8"))
    stack = receipt["liveStack"]
    payload = payload_accounting(stack["sessions"], stack["systemPromptMib"] * MIB, stack["kvMibPerSession"] * MIB)
    assert payload["conventional"] == receipt["latency"]["payloadBytesPerTurn"]["conventional"]
    assert payload["tinyFootprint"] == receipt["latency"]["payloadBytesPerTurn"]["tinyFootprint"]


def test_the_delta_has_a_floor_of_one_byte() -> None:
    assert delta_bytes(0) == 1
    assert delta_bytes(100) == 15
    assert delta_bytes(100, fraction=0.5) == 50


def test_empty_stacks_do_not_divide_by_zero() -> None:
    assert alloc_accounting(0, 0, 0, 0)["reductionRatio"] == 0.0
    assert payload_accounting(0, 0, 0)["trafficReductionRatio"] is None
