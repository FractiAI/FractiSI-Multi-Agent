import sys

import pytest

from tiny_footprint_labs.common.receipt import LabNotRunnable
from tiny_footprint_labs.gpu_live.cuda import CudaAlloc


def test_an_absent_runtime_means_not_runnable_rather_than_a_failure() -> None:
    with pytest.raises(LabNotRunnable) as caught:
        CudaAlloc("/nonexistent/libnvcuda.so")
    assert caught.value.reason == "nvcuda_unavailable"


@pytest.mark.skipif(sys.platform == "win32", reason="this host may have the runtime")
def test_the_default_path_is_absent_off_windows() -> None:
    with pytest.raises(LabNotRunnable):
        CudaAlloc()
