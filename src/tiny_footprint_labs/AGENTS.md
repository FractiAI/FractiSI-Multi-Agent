# Python labs

Import `torch`, `transformers` and `matplotlib` only inside modules or functions that need them, so `common/` and `h100/` work with the standard library alone: the GPU lab runs on a customer's bare `python3`. Tests mirror this tree under `tests/tiny_footprint_labs/`.
