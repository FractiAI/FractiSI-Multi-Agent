"""Shared fixtures. Everything here is real: real files and, for the LLM tests, a real model."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture(scope="session")
def repo_root() -> Path:
    return ROOT


@pytest.fixture(scope="session")
def summary() -> dict[str, Any]:
    """The committed analysis summary: real receipts, reduced by the real pipeline."""
    return json.loads((ROOT / "output" / "data" / "analysis_summary.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def historical() -> Path:
    return ROOT / "research" / "synthobs-tiny-gateway-rhyming-templates" / "data"


@pytest.fixture(scope="session")
def tiny_model_dir(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """A small GPT-2 with random weights and a word tokenizer, saved locally. No network."""
    pytest.importorskip("torch")
    transformers = pytest.importorskip("transformers")
    tokenizers = pytest.importorskip("tokenizers")
    from tiny_footprint_labs.llm.prompts import SYSTEM_PREFIX, session_turn

    words = sorted({*SYSTEM_PREFIX.split(), *session_turn(1, 1).split()})
    vocab = {"[UNK]": 0, **{word: index + 1 for index, word in enumerate(words)}}
    backend = tokenizers.Tokenizer(tokenizers.models.WordLevel(vocab, unk_token="[UNK]"))
    backend.pre_tokenizer = tokenizers.pre_tokenizers.WhitespaceSplit()
    directory = tmp_path_factory.mktemp("tiny-model")
    transformers.PreTrainedTokenizerFast(tokenizer_object=backend, unk_token="[UNK]").save_pretrained(directory)
    config = transformers.GPT2Config(
        vocab_size=len(vocab) + 1, n_positions=512, n_embd=16, n_layer=2, n_head=2, tie_word_embeddings=True
    )
    transformers.GPT2LMHeadModel(config).save_pretrained(directory)
    return directory


@pytest.fixture(scope="session")
def tiny_model(tiny_model_dir: Path) -> Any:
    transformers = pytest.importorskip("transformers")
    model = transformers.AutoModelForCausalLM.from_pretrained(tiny_model_dir)
    model.eval()
    return model
