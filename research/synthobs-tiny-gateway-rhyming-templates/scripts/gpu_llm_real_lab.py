#!/usr/bin/env python3
"""
Tiny Footprint · REAL local-GPU LLM lab (inference + training).

Runs on this machine's GeForce via torch-directml (or CUDA if available).
Compares conventional duplicated-prefix serving vs Tiny Footprint shared-prefix
reuse, and a tiny training step with shared vs duplicated optimizer state.

Honesty: measured wall-clock + process/GPU samples on a small causal LM — not a
frontier hosted API bake-off; DirectML ≠ CUDA HBM datacenter attestation.
"""
from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import sys
import time
from pathlib import Path


MODEL_ID_DEFAULT = "sshleifer/tiny-gpt2"
# Long shared system/policy block — the duplicated-resident-state rent LLM servers pay.
SYSTEM_PREFIX = (
    "You are Tiny Footprint serving fabric. Shared organizational pattern once. "
    "Policy: be concise, exact, and reuse templates. "
    "Tools: search, retrieve, cite, refuse unsafe ops. "
    "Style: professional, no marketing fluff, measure before claiming CapEx. "
) * 12


def nvidia_smi_used_mib() -> int | None:
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return int(out.splitlines()[0].strip())
    except Exception:
        return None


def nvidia_smi_device() -> dict:
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        line = out.splitlines()[0].strip()
        parts = [p.strip() for p in line.rsplit(",", 2)]
        if len(parts) == 3:
            return {"name": parts[0], "totalMib": int(float(parts[1])), "driverVersion": parts[2]}
        return {"name": line}
    except Exception as e:
        return {"name": "unknown", "error": str(e)}


def pick_device():
    import torch

    if torch.cuda.is_available():
        return torch.device("cuda"), "cuda"
    try:
        import torch_directml as dml

        return dml.device(), "directml"
    except Exception:
        return torch.device("cpu"), "cpu"


def summarize_ms(samples: list[float]) -> dict:
    if not samples:
        return {"n": 0, "meanMs": None, "p50Ms": None}
    ordered = sorted(samples)
    n = len(ordered)
    p50 = ordered[n // 2] if n % 2 else 0.5 * (ordered[n // 2 - 1] + ordered[n // 2])
    return {"n": n, "meanMs": statistics.fmean(ordered), "p50Ms": p50, "minMs": ordered[0], "maxMs": ordered[-1]}


def sync_device(backend: str):
    import torch

    if backend == "cuda" and torch.cuda.is_available():
        torch.cuda.synchronize()


def peak_alloc_mib(backend: str) -> float | None:
    import torch

    if backend == "cuda" and torch.cuda.is_available():
        return torch.cuda.max_memory_allocated() / (1024 * 1024)
    return None


def reset_peak(backend: str):
    import torch

    if backend == "cuda" and torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()
        torch.cuda.empty_cache()


def run_lab(
    model_id: str = MODEL_ID_DEFAULT,
    sessions: int = 8,
    user_turns: int = 4,
    new_tokens: int = 12,
    trials: int = 5,
    train_steps: int = 8,
) -> dict:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    device_info = nvidia_smi_device()
    device, backend = pick_device()
    idle_mib = nvidia_smi_used_mib()

    tok = AutoTokenizer.from_pretrained(model_id)
    if tok.pad_token is None:
        tok.pad_token = tok.eos_token
    model = AutoModelForCausalLM.from_pretrained(model_id)
    model.to(device)
    model.eval()
    n_params = sum(p.numel() for p in model.parameters())

    users = [f"Session {i}: summarize Tiny Footprint for ops lead {i}." for i in range(sessions)]

    def encode(text: str):
        return {k: v.to(device) for k, v in tok(text, return_tensors="pt").items()}

    def prefill_ms(batch_text: str) -> float:
        ids = encode(batch_text)
        sync_device(backend)
        t0 = time.perf_counter()
        with torch.no_grad():
            out = model(**ids, use_cache=True)
            _ = out.logits
        sync_device(backend)
        return (time.perf_counter() - t0) * 1000.0

    def generate_ms(prompt: str) -> tuple[float, int]:
        ids = encode(prompt)
        sync_device(backend)
        t0 = time.perf_counter()
        with torch.no_grad():
            gen = model.generate(
                **ids,
                max_new_tokens=new_tokens,
                do_sample=False,
                pad_token_id=tok.eos_token_id,
                use_cache=True,
            )
        sync_device(backend)
        ms = (time.perf_counter() - t0) * 1000.0
        return ms, int(gen.shape[-1] - ids["input_ids"].shape[-1])

    # Warmup
    for _ in range(2):
        prefill_ms(SYSTEM_PREFIX + " " + users[0])
        generate_ms(SYSTEM_PREFIX + " " + users[0])

    # --- Inference: WITHOUT Tiny Footprint = full system prefix every session ---
    reset_peak(backend)
    smi_before_conv = nvidia_smi_used_mib()
    conv_prefill = []
    conv_gen = []
    for _ in range(trials):
        t_pre = 0.0
        t_gen = 0.0
        for u in users:
            for turn in range(user_turns):
                prompt = f"{SYSTEM_PREFIX}\nUser: {u} turn={turn}\nAssistant:"
                t_pre += prefill_ms(prompt)
                gms, _ = generate_ms(prompt)
                t_gen += gms
        conv_prefill.append(t_pre)
        conv_gen.append(t_gen)
    smi_after_conv = nvidia_smi_used_mib()
    conv_peak = peak_alloc_mib(backend)

    # --- Inference: WITH Tiny Footprint = shared prefix KV once, then user deltas ---
    reset_peak(backend)
    smi_before_tiny = nvidia_smi_used_mib()
    tiny_prefill = []
    tiny_gen = []

    def prefill_with_shared_prefix_ms(past, prefix_len: int, user_text: str) -> float:
        ids = encode(user_text)
        user_len = ids["input_ids"].shape[1]
        attn = torch.ones((1, prefix_len + user_len), device=device, dtype=torch.long)
        # position ids continue after the shared prefix
        pos = torch.arange(prefix_len, prefix_len + user_len, device=device).unsqueeze(0)
        sync_device(backend)
        t0 = time.perf_counter()
        with torch.no_grad():
            out = model(
                input_ids=ids["input_ids"],
                attention_mask=attn,
                position_ids=pos,
                past_key_values=past,
                use_cache=True,
            )
            _ = out.logits
        sync_device(backend)
        return (time.perf_counter() - t0) * 1000.0

    def generate_with_shared_prefix_ms(past, prefix_len: int, user_text: str) -> float:
        ids = encode(user_text)
        user_len = ids["input_ids"].shape[1]
        attn = torch.ones((1, prefix_len + user_len), device=device, dtype=torch.long)
        sync_device(backend)
        t0 = time.perf_counter()
        with torch.no_grad():
            gen = model.generate(
                input_ids=ids["input_ids"],
                attention_mask=attn,
                past_key_values=past,
                max_new_tokens=new_tokens,
                do_sample=False,
                pad_token_id=tok.eos_token_id,
                use_cache=True,
            )
            _ = gen.shape
        sync_device(backend)
        return (time.perf_counter() - t0) * 1000.0

    for _ in range(trials):
        t_pre = 0.0
        t_gen = 0.0
        prefix_ids = encode(SYSTEM_PREFIX)
        prefix_len = int(prefix_ids["input_ids"].shape[1])
        sync_device(backend)
        t0 = time.perf_counter()
        with torch.no_grad():
            prefix_out = model(**prefix_ids, use_cache=True)
            past = prefix_out.past_key_values
        sync_device(backend)
        t_pre += (time.perf_counter() - t0) * 1000.0
        for u in users:
            for turn in range(user_turns):
                user_only = f"\nUser: {u} turn={turn}\nAssistant:"
                t_pre += prefill_with_shared_prefix_ms(past, prefix_len, user_only)
                t_gen += generate_with_shared_prefix_ms(past, prefix_len, user_only)
        tiny_prefill.append(t_pre)
        tiny_gen.append(t_gen)
    smi_after_tiny = nvidia_smi_used_mib()
    tiny_peak = peak_alloc_mib(backend)

    conv_pre = summarize_ms(conv_prefill)
    tiny_pre = summarize_ms(tiny_prefill)
    conv_g = summarize_ms(conv_gen)
    tiny_g = summarize_ms(tiny_gen)

    def ratio(a, b):
        if a is None or b is None or b == 0:
            return None
        return a / b

    prefill_speedup = ratio(conv_pre["p50Ms"], tiny_pre["p50Ms"])
    gen_speedup = ratio(conv_g["p50Ms"], tiny_g["p50Ms"])

    # --- Training microbench: tiny AdamW steps ---
    model.train()
    # shared corpus
    train_texts = [SYSTEM_PREFIX + " " + u for u in users[: min(4, sessions)]]
    encs = [tok(t, return_tensors="pt", truncation=True, max_length=64) for t in train_texts]

    def train_mode_duplicated() -> dict:
        """WITHOUT: fresh optimizer (+ optional clone) simulating duplicated resident train state."""
        import copy

        m = AutoModelForCausalLM.from_pretrained(model_id).to(device)
        m.train()
        # duplicate optimizer state by running N independent optimizers (producer anti-pattern)
        opts = [torch.optim.AdamW(m.parameters(), lr=1e-4) for _ in range(min(4, sessions))]
        reset_peak(backend)
        smi0 = nvidia_smi_used_mib()
        times = []
        for step in range(train_steps):
            sync_device(backend)
            t0 = time.perf_counter()
            for opt, enc in zip(opts, encs):
                batch = {k: v.to(device) for k, v in enc.items()}
                labels = batch["input_ids"]
                opt.zero_grad(set_to_none=True)
                loss = m(**batch, labels=labels).loss
                loss.backward()
                opt.step()
            sync_device(backend)
            times.append((time.perf_counter() - t0) * 1000.0)
        smi1 = nvidia_smi_used_mib()
        del opts, m
        return {
            "stepMs": summarize_ms(times),
            "nvidiaSmiDeltaMib": None if smi0 is None or smi1 is None else max(0, smi1 - smi0),
            "torchPeakAllocMib": peak_alloc_mib(backend),
            "optimizerCopies": len(encs),
        }

    def train_mode_tiny() -> dict:
        """WITH Tiny Footprint: one shared model + one optimizer (shared resident state)."""
        m = AutoModelForCausalLM.from_pretrained(model_id).to(device)
        m.train()
        opt = torch.optim.AdamW(m.parameters(), lr=1e-4)
        reset_peak(backend)
        smi0 = nvidia_smi_used_mib()
        times = []
        for step in range(train_steps):
            sync_device(backend)
            t0 = time.perf_counter()
            for enc in encs:
                batch = {k: v.to(device) for k, v in enc.items()}
                labels = batch["input_ids"]
                opt.zero_grad(set_to_none=True)
                loss = m(**batch, labels=labels).loss
                loss.backward()
                opt.step()
            sync_device(backend)
            times.append((time.perf_counter() - t0) * 1000.0)
        smi1 = nvidia_smi_used_mib()
        del opt, m
        return {
            "stepMs": summarize_ms(times),
            "nvidiaSmiDeltaMib": None if smi0 is None or smi1 is None else max(0, smi1 - smi0),
            "torchPeakAllocMib": peak_alloc_mib(backend),
            "optimizerCopies": 1,
        }

    train_conv = train_mode_duplicated()
    train_tiny = train_mode_tiny()
    train_speedup = ratio(train_conv["stepMs"]["p50Ms"], train_tiny["stepMs"]["p50Ms"])

    train_mem_conv = train_conv.get("nvidiaSmiDeltaMib")
    train_mem_tiny = train_tiny.get("nvidiaSmiDeltaMib")
    train_mem_saving = None
    if train_mem_conv is not None and train_mem_tiny is not None and train_mem_conv > 0:
        train_mem_saving = 1.0 - (train_mem_tiny / train_mem_conv)

    # Real-lab gate: ran on accelerator + produced paired metrics (speedups may be <1 on tiny models)
    ok = backend != "cpu" and prefill_speedup is not None and train_speedup is not None
    return {
        "ok": ok,
        "product": "Tiny Footprint",
        "labKind": "real_llm_local_gpu",
        "device": device_info.get("name"),
        "deviceDetail": {**device_info, "backend": backend, "torchDevice": str(device)},
        "model": {"id": model_id, "parameterCount": n_params},
        "workload": {
            "sessions": sessions,
            "userTurns": user_turns,
            "newTokens": new_tokens,
            "trials": trials,
            "trainSteps": train_steps,
        },
        "inference": {
            "withoutTinyFootprint": {
                "prefillBatchMs": conv_pre,
                "generateBatchMs": conv_g,
                "nvidiaSmiUsedMib": smi_after_conv,
                "torchPeakAllocMib": conv_peak,
            },
            "withTinyFootprint": {
                "prefillBatchMs": tiny_pre,
                "generateBatchMs": tiny_g,
                "nvidiaSmiUsedMib": smi_after_tiny,
                "torchPeakAllocMib": tiny_peak,
            },
            "comparison": {
                "prefillP50Speedup": prefill_speedup,
                "generateP50Speedup": gen_speedup,
                "prefillFasterWithTinyFootprint": bool(prefill_speedup and prefill_speedup > 1.0),
            },
        },
        "training": {
            "withoutTinyFootprint": train_conv,
            "withTinyFootprint": train_tiny,
            "comparison": {
                "stepP50Speedup": train_speedup,
                "fasterWithTinyFootprint": bool(train_speedup and train_speedup > 1.0),
                "nvidiaSmiDeltaReductionRatio": train_mem_saving,
                "lessResidentTrainMemoryWithTinyFootprint": bool(
                    train_mem_conv is not None
                    and train_mem_tiny is not None
                    and train_mem_tiny < train_mem_conv
                ),
            },
        },
        "nvidiaSmi": {"idleMib": idle_mib},
        "honesty": (
            "Real local-GPU causal-LM forward/generate + AdamW train microbench "
            f"on {device_info.get('name')} via {backend}. "
            "Tiny Footprint = shared system-prefix KV reuse + single optimizer; "
            "without = duplicated full-prefix prefill per session + multiple optimizer copies. "
            "Not frontier decode TTFT on a hosted API; DirectML/CUDA on laptop GeForce ≠ datacenter HBM proof."
        ),
        "passRealLlmGate": bool(ok),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=MODEL_ID_DEFAULT)
    ap.add_argument("--sessions", type=int, default=8)
    ap.add_argument("--user-turns", type=int, default=3)
    ap.add_argument("--new-tokens", type=int, default=12)
    ap.add_argument("--trials", type=int, default=3)
    ap.add_argument("--train-steps", type=int, default=6)
    ap.add_argument("--out", default="")
    args = ap.parse_args()
    try:
        report = run_lab(
            model_id=args.model,
            sessions=args.sessions,
            user_turns=args.user_turns,
            new_tokens=args.new_tokens,
            trials=args.trials,
            train_steps=args.train_steps,
        )
    except Exception as e:
        report = {
            "ok": False,
            "error": str(e),
            "product": "Tiny Footprint",
            "labKind": "real_llm_local_gpu",
        }
    text = json.dumps(report, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    print(text)
    return 0 if report.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
