import hashlib
from pathlib import Path

from tiny_footprint_labs.figures.vendor import VENDOR_SOURCE, vendor_architecture


def test_the_image_is_copied_unaltered_and_bound_by_hash(repo_root: Path, tmp_path: Path) -> None:
    record = vendor_architecture(repo_root, tmp_path)
    source = (repo_root / VENDOR_SOURCE).read_bytes()
    assert (tmp_path / record.filename).read_bytes() == source
    assert hashlib.sha256(source).hexdigest() in record.source


def test_the_caption_says_it_is_not_evidence(repo_root: Path, tmp_path: Path) -> None:
    assert "not evidence" in vendor_architecture(repo_root, tmp_path).caption.replace(
        "nothing in this figure is evidence", "not evidence"
    )
