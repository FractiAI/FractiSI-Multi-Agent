import sys

import pytest

from tiny_footprint_labs.common.receipt import LabNotRunnable
from tiny_footprint_labs.gpu_live.lab import run_lab


@pytest.mark.skipif(sys.platform == "win32", reason="this host may have the runtime")
def test_on_a_host_without_the_runtime_the_lab_is_not_runnable() -> None:
    with pytest.raises(LabNotRunnable) as caught:
        run_lab()
    assert caught.value.reason == "nvcuda_unavailable"
