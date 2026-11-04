"""Minimal ctypes binding to the NVIDIA driver's nvcuda library."""

from __future__ import annotations

from ctypes import CDLL, POINTER, c_int, c_size_t, c_uint, c_ulonglong, c_void_p
from typing import Any

from tiny_footprint_labs.common.receipt import LabNotRunnable

NVCUDA_PATH = r"C:\Windows\System32\nvcuda.dll"


class CudaAlloc:
    """One device context plus the allocations made in it."""

    def __init__(self, library_path: str = NVCUDA_PATH) -> None:
        try:
            self.dll = CDLL(library_path)
        except OSError as error:
            # The loader's message lists every path it tried; keep only its first clause.
            raise LabNotRunnable("nvcuda_unavailable", str(error).split(",")[0]) from error
        self.dll.cuInit.argtypes = [c_uint]
        self.dll.cuInit.restype = c_int
        self.dll.cuDeviceGet.argtypes = [POINTER(c_int), c_int]
        self.dll.cuDeviceGet.restype = c_int
        self.dll.cuCtxCreate_v2.argtypes = [POINTER(c_void_p), c_uint, c_int]
        self.dll.cuCtxCreate_v2.restype = c_int
        self.dll.cuMemAlloc_v2.argtypes = [POINTER(c_ulonglong), c_size_t]
        self.dll.cuMemAlloc_v2.restype = c_int
        self.dll.cuMemFree_v2.argtypes = [c_ulonglong]
        self.dll.cuMemFree_v2.restype = c_int
        self.dll.cuCtxDestroy_v2.argtypes = [c_void_p]
        self.dll.cuCtxDestroy_v2.restype = c_int
        self.dll.cuMemcpyHtoD_v2.argtypes = [c_ulonglong, c_void_p, c_size_t]
        self.dll.cuMemcpyHtoD_v2.restype = c_int
        self.dll.cuCtxSynchronize.argtypes = []
        self.dll.cuCtxSynchronize.restype = c_int
        result = self.dll.cuInit(0)
        if result != 0:
            raise LabNotRunnable("cuda_init_failed", f"cuInit returned {result}")
        device = c_int()
        result = self.dll.cuDeviceGet(device, 0)
        if result != 0:
            raise LabNotRunnable("cuda_device_unavailable", f"cuDeviceGet returned {result}")
        context = c_void_p()
        result = self.dll.cuCtxCreate_v2(context, 0, device)
        if result != 0:
            raise RuntimeError(f"cuCtxCreate failed {result}")
        self.ctx: Any = context
        self.ptrs: list[int] = []

    def alloc(self, nbytes: int) -> int:
        pointer = c_ulonglong()
        result = self.dll.cuMemAlloc_v2(pointer, c_size_t(nbytes))
        if result != 0:
            raise RuntimeError(f"cuMemAlloc failed {result} for {nbytes} bytes")
        self.ptrs.append(pointer.value)
        return pointer.value

    def htod(self, device_ptr: int, host_buf: Any, nbytes: int) -> None:
        result = self.dll.cuMemcpyHtoD_v2(c_ulonglong(device_ptr), host_buf, c_size_t(nbytes))
        if result != 0:
            raise RuntimeError(f"cuMemcpyHtoD failed {result}")

    def sync(self) -> None:
        result = self.dll.cuCtxSynchronize()
        if result != 0:
            raise RuntimeError(f"cuCtxSynchronize failed {result}")

    def free(self, pointer: int) -> None:
        self.dll.cuMemFree_v2(c_ulonglong(pointer))
        if pointer in self.ptrs:
            self.ptrs.remove(pointer)

    def free_all_but_first(self) -> None:
        while len(self.ptrs) > 1:
            self.free(self.ptrs[-1])

    def close(self) -> None:
        for pointer in list(self.ptrs):
            self.free(pointer)
        if self.ctx:
            self.dll.cuCtxDestroy_v2(self.ctx)
            self.ctx = None
