from tiny_footprint_labs.gpu_live.latency import HONESTY, _filled_buffer


def test_buffers_have_non_zero_pages_so_a_driver_cannot_elide_the_copy() -> None:
    buffer = _filled_buffer(8192, 7)
    assert len(buffer) == 8192
    assert buffer[0] == b"\x07"
    assert buffer[4096] == b"\x07"
    assert buffer[1] == b"\x00"


def test_it_says_what_it_does_not_measure() -> None:
    assert "Not frontier LLM decode" in HONESTY
