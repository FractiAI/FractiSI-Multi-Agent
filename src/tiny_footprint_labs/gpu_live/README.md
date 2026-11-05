# GPU lab

Allocates buffers and copies them on a real NVIDIA device, sampling `nvidia-smi`. It needs the NVIDIA runtime and reports `not_run` without it.

## Contents

| Path | What it is |
|---|---|
| [`__init__.py`](__init__.py) | Live GPU chat-stack lab: buffer allocation and host-to-device copies on NVIDIA. |
| [`accounting.py`](accounting.py) | Buffer accounting for the live GPU lab. |
| [`cuda.py`](cuda.py) | Minimal ctypes binding to the NVIDIA driver's nvcuda library. |
| [`lab.py`](lab.py) | Live chat-stack device-memory and latency lab on a real NVIDIA device. |
| [`latency.py`](latency.py) | Materialization latency with versus without Tiny Footprint, on a real NVIDIA device. |
