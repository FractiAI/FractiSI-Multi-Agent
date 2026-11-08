# Open Source License Audit

**Document ID:** `open-source-license-audit-2026-11`  
**Scope:** World-model projects evaluated for FractiSI Multi-Agent assimilation  
**Date:** 2026-11-08

## Honesty boundary

License status was verified from public GitHub LICENSE files, Hugging Face model cards, and vendor license pages this session. This is not formal legal advice. Re-check before shipping any redistributed weights.

## Summary table

| Asset | SPDX / identifier | Code commercial OK? | Weights commercial OK? | Attribution / notices | Derivative restrictions | FractiSI use |
|---|---|---|---|---|---|---|
| DreamerV3 (`danijar/dreamerv3`) | MIT | Yes | N/A (train per env) | Keep copyright | None beyond MIT | Reference + rebuild patterns |
| V-JEPA2 code | MIT (+ bits Apache-2.0) | Yes | — | Keep notices | Apache notice on those files | Rebuild patterns; optional encoder later |
| V-JEPA2 HF weights | Apache-2.0 | — | Yes | Apache NOTICE | Apache-2.0 | Optional-external only |
| DIAMOND | MIT | Yes | Train artifacts | Keep copyright | None beyond MIT | Pattern reference |
| Jafar (Genie reimpl) | Apache-2.0 | Yes | Per release | NOTICE | Apache-2.0 | Pattern reference |
| Cosmos Predict*/Transfer*/Reason* **code** | Apache-2.0 | Yes | — | Apache | Apache-2.0 | Optional-external |
| Cosmos Predict1-era **weights** | NVIDIA Open Model License (custom; no SPDX) | — | Yes w/ terms | Retain NVIDIA terms; Guardrail circumvention terminates | Custom | Optional-external; do not strip guardrails |
| Cosmos 3 code+models | OpenMDW-1.1 (LF; GitHub often `NOASSERTION`) | Yes | Yes under OpenMDW | Retain license + origin | OpenMDW terms | Optional-external |
| LingBot-World **v1** | Apache-2.0 | Likely yes | Likely yes (verify Wan2.2 deps) | Apache | Apache | Research / demo only |
| LingBot-World **v2** | **CC BY-NC-SA 4.0** | **No** | **No** | BY + NC + SA | ShareAlike; NonCommercial | **Reject for commercial core** |
| IRIS | GPL-3.0 | Contagious | — | GPL | Strong copyleft | **Reject** for proprietary core |

## Provenance policy for FractiSI

1. Prefer **original FractiSI implementations** of reusable computational patterns (already done for RSSM-lite / CEM-lite).  
2. Do **not** copy restricted source or weights into this repository.  
3. Do **not** download enormous models unless a named experiment requires them and license is cleared.  
4. Optional-external adapters must load provider weights at runtime under operator license acceptance — never vend NC weights.  
5. Preserve required notices in any redistributed third-party code.

## Inaccessible / incomplete artifacts

| Artifact | Status |
|---|---|
| LingBot-World v2 Agentic Harness | **Not released** (public issue asks for it) |
| LingBot-World v2 deployment code | Explicitly not released |
| Cosmos full pretrain datasets | Not required; not fetched |

## Recommendation

Safe path for FractiSI Multi-Agent commercial editions: **rebuild MIT/Apache-pattern algorithms in-house**; treat NVIDIA Cosmos and V-JEPA weights as optional operator-supplied sidecars; never ship LingBot v2 or GPL-contaminated cores inside the product.
