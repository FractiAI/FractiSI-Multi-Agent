"""Real-model lab: one model on one backend, with and without a shared prefix.

"With Tiny Footprint" here is shared-prefix KV reuse, which is what a production
prefix cache does. This lab therefore tests prefix sharing. It is not a test of
rhyming, where the words differ and a prefix cache cannot help.
"""

from __future__ import annotations

import platform
import subprocess
from importlib import metadata
from pathlib import Path
from typing import Any

from tiny_footprint_labs.common.receipt import LabNotRunnable
from tiny_footprint_labs.llm.device import pick_device
from tiny_footprint_labs.llm.inference import check_equivalence, measure_rhyme_sharing, measure_timing
from tiny_footprint_labs.llm.prompts import SYSTEM_PREFIX, session_turn
from tiny_footprint_labs.llm.residency import measure_residency
from tiny_footprint_labs.llm.training import measure_training

MODEL_ID_DEFAULT = "sshleifer/tiny-gpt2"
ACCELERATOR_BACKENDS = ("cuda", "mps", "directml")
HONESTY = (
    "Real causal-LM forward passes and greedy decode on this host. Tiny Footprint here means "
    "shared-prefix KV reuse, which a production prefix cache already provides, so this lab "
    "does not show an advantage over one. The baseline re-prefills the full prompt every turn. "
    "A consumer accelerator is not datacenter HBM and this is not a hosted frontier bake-off."
)


def host_cpu_name() -> str:
    """Human-readable CPU name, falling back to the machine architecture."""
    system = platform.system()
    if system == "Darwin":
        try:
            return subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"], text=True).strip()
        except (OSError, subprocess.SubprocessError):
            return platform.machine()
    if system == "Linux":
        try:
            for line in Path("/proc/cpuinfo").read_text(encoding="utf-8").splitlines():
                if line.startswith("model name"):
                    return line.split(":", 1)[1].strip()
        except OSError:
            return platform.machine()
    return platform.processor() or platform.machine()


def device_label(torch: Any, backend: str) -> str:
    """Name the device that actually ran the lab."""
    if backend == "cuda":
        return str(torch.cuda.get_device_name(0))
    return host_cpu_name()


def load_float32_model(model_class: Any, torch: Any, model_id: str, revision: str | None) -> Any:
    """Load weights as float32; the keyword differs between transformers generations."""
    try:
        return model_class.from_pretrained(model_id, revision=revision, dtype=torch.float32)
    except TypeError:
        return model_class.from_pretrained(model_id, revision=revision, torch_dtype=torch.float32)


def _load_stack() -> tuple[Any, Any, Any]:
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError as error:
        raise LabNotRunnable("llm_stack_unavailable", str(error)) from error
    return torch, AutoModelForCausalLM, AutoTokenizer


def run_lab(
    model_id: str = MODEL_ID_DEFAULT,
    revision: str | None = None,
    backend_preference: str = "auto",
    sessions: int = 6,
    user_turns: int = 2,
    new_tokens: int = 8,
    trials: int = 3,
    warmup: int = 2,
    train_steps: int = 5,
    prefix_tokens: int = 256,
    logit_tolerance: float = 5e-2,
    materialize_trials: int = 16,
    seed: int = 20261103,
) -> dict[str, Any]:
    """Run timing, equivalence, residency and (optionally) training, and build the receipt."""
    torch, model_class, tokenizer_class = _load_stack()
    torch.manual_seed(seed)
    device, backend = pick_device(backend_preference)

    tokenizer = tokenizer_class.from_pretrained(model_id, revision=revision)
    loaded = load_float32_model(model_class, torch, model_id, revision)
    loaded.to(device)
    loaded.eval()
    parameter_count = sum(parameter.numel() for parameter in loaded.parameters())

    def encode(text: str) -> Any:
        return tokenizer(text, return_tensors="pt")["input_ids"].to(device)

    prefix_ids = encode(SYSTEM_PREFIX)[:, :prefix_tokens]
    suffix_ids_per_turn = [encode(session_turn(s, t)) for s in range(sessions) for t in range(user_turns)]
    suffix_length = min(int(ids.shape[1]) for ids in suffix_ids_per_turn)
    suffix_ids_per_turn = [ids[:, :suffix_length] for ids in suffix_ids_per_turn]

    timing = measure_timing(loaded, backend, prefix_ids, suffix_ids_per_turn, new_tokens, trials, warmup, seed)
    equivalence = check_equivalence(loaded, prefix_ids, suffix_ids_per_turn, new_tokens, logit_tolerance)
    rhyme_sharing = measure_rhyme_sharing(loaded, prefix_ids, suffix_ids_per_turn, new_tokens, logit_tolerance)
    residency = measure_residency(
        loaded,
        backend,
        prefix_ids,
        suffix_ids_per_turn[::user_turns],
        dtype_bytes=4,
        materialize_trials=materialize_trials,
    )

    training = None
    if train_steps > 0:
        encoded = [torch.cat([prefix_ids[:, :48], suffix], dim=1) for suffix in suffix_ids_per_turn[: min(4, sessions)]]

        def fresh_model() -> Any:
            return load_float32_model(model_class, torch, model_id, revision).to(device)

        training = measure_training(fresh_model, encoded, backend, train_steps, warmup=warmup, seed=seed)

    on_accelerator = backend in ACCELERATOR_BACKENDS
    config = loaded.config
    return {
        "ok": bool(equivalence["equivalent"]),
        "status": "pass" if equivalence["equivalent"] else "fail",
        "product": "Tiny Footprint",
        "labKind": "real_llm_local_gpu" if on_accelerator else "real_llm_local_cpu",
        "device": device_label(torch, backend),
        "backend": backend,
        "deviceDetail": {"backend": backend, "torchDevice": str(device), "machine": platform.machine()},
        "model": {
            "id": model_id,
            "revision": revision,
            "parameterCount": parameter_count,
            "layers": config.n_layer,
            "heads": config.n_head,
            "headDim": config.n_embd // config.n_head,
            "dtype": "float32",
        },
        "software": {
            "python": platform.python_version(),
            "torch": torch.__version__,
            "transformers": metadata.version("transformers"),
        },
        "workload": {
            "sessions": sessions,
            "userTurns": user_turns,
            "newTokens": new_tokens,
            "trials": trials,
            "warmup": warmup,
            "trainSteps": train_steps,
            "prefixTokens": int(prefix_ids.shape[1]),
            "suffixTokens": suffix_length,
            "seed": seed,
        },
        "inference": timing,
        "equivalence": equivalence,
        "rhymeSharing": rhyme_sharing,
        "residency": residency,
        "training": training,
        "honesty": HONESTY,
        "passRealLlmGate": bool(equivalence["equivalent"]) and on_accelerator,
    }
