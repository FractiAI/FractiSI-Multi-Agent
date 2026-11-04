# Labs

Adapters that run the Python labs and report what happened in this invocation.

## Contents

| Path | What it is |
|---|---|
| [`gpu-live-lab.mjs`](gpu-live-lab.mjs) | Adapter for the live GPU chat-stack lab (Python, nvcuda, nvidia-smi). |
| [`gpu-llm-real-lab.mjs`](gpu-llm-real-lab.mjs) | Adapter for the real-model lab (torch and transformers). |
| [`h100-sim-lab.mjs`](h100-sim-lab.mjs) | Adapter for the H100 residency roofline. |
| [`lab-status.mjs`](lab-status.mjs) | Outcome vocabulary for optional labs. |
| [`python-runner.mjs`](python-runner.mjs) | Run one Python lab script and return only what that invocation produced. |
