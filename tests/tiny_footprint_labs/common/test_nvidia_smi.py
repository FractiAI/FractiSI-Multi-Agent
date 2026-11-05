from tiny_footprint_labs.common.nvidia_smi import device_info, parse_device_line, sample_peak, used_mib


def test_a_device_line_parses_even_with_commas_in_the_name() -> None:
    assert parse_device_line("NVIDIA GeForce GTX 860M, 2048, 512.77") == {
        "name": "NVIDIA GeForce GTX 860M",
        "totalMib": 2048,
        "driverVersion": "512.77",
    }
    assert parse_device_line("Vendor, Model X, 8192, 1.0")["name"] == "Vendor, Model X"


def test_an_unexpected_line_keeps_the_text_and_no_numbers() -> None:
    assert parse_device_line("something odd") == {"name": "something odd", "totalMib": None, "driverVersion": None}


def test_queries_answer_without_raising_on_any_host() -> None:
    used = used_mib()
    assert used is None or used >= 0
    assert "name" in device_info()
    peak = sample_peak(duration_s=0.01)
    assert peak is None or peak >= 0
