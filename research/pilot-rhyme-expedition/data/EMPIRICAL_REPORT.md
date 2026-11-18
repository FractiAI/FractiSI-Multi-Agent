# Pilot Rhyme Expedition · empirical report

**Document ID:** `WP-PILOT-RHYME-EXPEDITION-EGS-2026-11-18`
**Seed:** 20261118
**Runtime:** 30 ms

## Verdict

SUPPORTED — Pilot Rhyme recovered every mission, flat peers recovered none, exact-text role cache never hit on differing mission wording, and the rhyming store was substantially smaller than exact-cache and private copies.

Positive signal: **true**

Architectural / structured-state lab. Director/Pilot seats rebuild a published coordination pattern; no LingBot weights. Not CapEx, not embodied robotics, not an LLM bake-off.

## Discovery (wins / N)

| Arm | Wins | Win rate | Mean ops | Mean rounds |
|---|---:|---:|---:|---:|
| flat_peers | 0 | 0.0% | 40.0 | 6.0 |
| shared_text | 0 | 0.0% | 26.0 | 6.0 |
| director_pilot_private | 100 | 100.0% | 6.0 | 6.0 |
| director_pilot_exact_cache | 100 | 100.0% | 6.0 | 3.0 |
| director_pilot_rhyme | 100 | 100.0% | 12.0 | 3.0 |

## Store size

| Store | Bytes |
|---|---:|
| Pilot Rhyme (template once + deltas) | 67243 |
| Exact-text role cache | 86161 (hits: 0) |
| Private Director/Pilot copies | 344644 |
| Flat peers | 429278 |
| Shared text | 88757 |

Rhyme vs exact cache: **22.0% smaller**
Rhyme vs private copies: **80.5% smaller**
