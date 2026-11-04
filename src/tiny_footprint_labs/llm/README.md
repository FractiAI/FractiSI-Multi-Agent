# Real-model lab

Real forward passes and greedy decode, with and without a shared prefix, plus measured KV residency. Each run covers one model on one backend.

## Contents

| Path | What it is |
|---|---|
| [`__init__.py`](__init__.py) | Real-model lab: forward passes, greedy decode and key-value residency. |
| [`device.py`](device.py) | Accelerator selection, synchronization and allocator readings. |
| [`inference.py`](inference.py) | Timing and equivalence for real forward passes with and without a shared prefix. |
| [`kv.py`](kv.py) | Key-value cache accounting and shape-independent tensor access. |
| [`lab.py`](lab.py) | Real-model lab: one model on one backend, with and without a shared prefix. |
| [`matrix.py`](matrix.py) | Run the real-model lab once per model and backend named in the benchmark plan. |
| [`prompts.py`](prompts.py) | The shared system block and per-session turns used by the real-model lab. |
| [`residency.py`](residency.py) | Measured key-value residency: N sessions held live, duplicated versus shared-prefix. |
| [`training.py`](training.py) | Training-step microbenchmark: one optimizer versus duplicated optimizer state. |
