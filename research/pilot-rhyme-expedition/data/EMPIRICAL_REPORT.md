# Pilot Rhyme Expedition · empirical report

**Document ID:** `WP-PILOT-RHYME-EXPEDITION-EGS-2026-11-18`
**Seed:** 20261118
**Runtime:** 608 ms

## Verdict

SUPPORTED — Pilot Rhyme recovered every mission, flat peers recovered none, exact-text role cache never hit on differing mission wording, and the rhyming store was substantially smaller than exact-cache and private copies.

Coordination positive signal: **true**
Theater candidate signal: **true** · **692** named discoveries

Architectural / structured-state lab. Director/Pilot seats rebuild a published coordination pattern; no LingBot weights. Theater candidate arm reuses Cosmic/LLM public fixtures. Not CapEx, not embodied robotics, not an LLM bake-off, not clinical genetics, not finished physics.

## Coordination lab (wins / N)

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

Rhyme vs exact cache: **22.0% smaller**
Rhyme vs private copies: **80.5% smaller**

## Theater candidate recovery

| Theater | Tasks | Flat | Pilot Rhyme | Named candidates (Pilot hit · flat miss) |
|---|---:|---:|---:|---:|
| cosmic · exoplanet | 169 | 0.0% | **100.0%** | 169 |
| cosmic · neo | 96 | 0.0% | **100.0%** | 96 |
| cosmic · ngc | 173 | 0.0% | **100.0%** | 173 |
| cosmic · wmap_tt | 148 | 0.0% | **100.0%** | 148 |
| genome · exon | 39 | 0.0% | **100.0%** | 39 |
| genome · chrM | 67 | 0.0% | **100.0%** | 67 |

## Discovery catalog (sample)

- **cosmic · exoplanet:** `Kepler-607 c ↔ TOI-1758 b` (pilot_rhyme_aware_only_partner, coupling 0.9526)
- **cosmic · exoplanet:** `Kepler-583 b ↔ Kepler-948 b` (pilot_rhyme_aware_only_partner, coupling 0.9741)
- **cosmic · exoplanet:** `TOI-1269 c ↔ TOI-1758 b` (pilot_rhyme_aware_only_partner, coupling 0.9795)
- **cosmic · exoplanet:** `EPIC 211822797 b ↔ Kepler-560 b` (pilot_rhyme_aware_only_partner, coupling 0.9707)
- **cosmic · exoplanet:** `Kepler-354 c ↔ Kepler-383 b` (pilot_rhyme_aware_only_partner, coupling 0.9897)
- **cosmic · exoplanet:** `Kepler-860 b ↔ Kepler-150 c` (pilot_rhyme_aware_only_partner, coupling 0.8968)
- **cosmic · exoplanet:** `Kepler-560 b ↔ Kepler-235 d` (pilot_rhyme_aware_only_partner, coupling 0.9773)
- **cosmic · exoplanet:** `Kepler-1349 b ↔ Kepler-334 b` (pilot_rhyme_aware_only_partner, coupling 0.9783)
- **cosmic · exoplanet:** `Kepler-1222 b ↔ Kepler-969 c` (pilot_rhyme_aware_only_partner, coupling 0.9854)
- **cosmic · exoplanet:** `Kepler-509 b ↔ Kepler-199 b` (pilot_rhyme_aware_only_partner, coupling 0.8723)
- **cosmic · exoplanet:** `K2-187 d ↔ TOI-880.02` (pilot_rhyme_aware_only_partner, coupling 0.9851)
- **cosmic · exoplanet:** `HD 156411 b ↔ HD 8535 b` (pilot_rhyme_aware_only_partner, coupling 0.9842)
- **cosmic · exoplanet:** `HD 240210 b ↔ gam1 Leo b` (pilot_rhyme_aware_only_partner, coupling 0.9719)
- **cosmic · exoplanet:** `HD 9446 b ↔ HD 155358 c` (pilot_rhyme_aware_only_partner, coupling 0.9069)
- **cosmic · exoplanet:** `HD 132563 b ↔ HD 220773 b` (pilot_rhyme_aware_only_partner, coupling 0.9911)
- **cosmic · exoplanet:** `Kepler-32 f ↔ Kepler-415 b` (pilot_rhyme_aware_only_partner, coupling 0.9457)
- **cosmic · exoplanet:** `Kepler-32 d ↔ Kepler-52 c` (pilot_rhyme_aware_only_partner, coupling 0.9700)
- **cosmic · exoplanet:** `Kepler-34 b ↔ Kepler-35 b` (pilot_rhyme_aware_only_partner, coupling 0.9729)
- **cosmic · exoplanet:** `HD 22781 b ↔ HD 147018 c` (pilot_rhyme_aware_only_partner, coupling 0.9634)
- **cosmic · exoplanet:** `eps CrB b ↔ tau Gem b` (pilot_rhyme_aware_only_partner, coupling 0.9779)
- **cosmic · exoplanet:** `Kepler-58 c ↔ Kepler-31 c` (pilot_rhyme_aware_only_partner, coupling 0.8816)
- **cosmic · exoplanet:** `Kepler-59 c ↔ Kepler-366 c` (pilot_rhyme_aware_only_partner, coupling 0.8970)
- **cosmic · exoplanet:** `KOI-217 b ↔ Kepler-33 c` (pilot_rhyme_aware_only_partner, coupling 0.6827)
- **cosmic · exoplanet:** `Kepler-42 d ↔ Kepler-32 e` (pilot_rhyme_aware_only_partner, coupling 0.9705)
- **cosmic · exoplanet:** `Kepler-529 d ↔ Kepler-607 c` (pilot_rhyme_aware_only_partner, coupling 0.9189)
- **cosmic · exoplanet:** `CoRoT-8 b ↔ WASP-23 b` (pilot_rhyme_aware_only_partner, coupling 0.9677)
- **cosmic · exoplanet:** `HD 155358 c ↔ HD 73526 c` (pilot_rhyme_aware_only_partner, coupling 0.9819)
- **cosmic · exoplanet:** `HD 220773 b ↔ HD 132563 b` (pilot_rhyme_aware_only_partner, coupling 0.9911)
- **cosmic · exoplanet:** `HR 8799 c ↔ HD 132563 b` (pilot_rhyme_aware_only_partner, coupling 0.9673)
- **cosmic · exoplanet:** `CoRoT-6 b ↔ Kepler-15 b` (pilot_rhyme_aware_only_partner, coupling 0.9495)
- **cosmic · exoplanet:** `HD 11964 c ↔ 61 Vir c` (pilot_rhyme_aware_only_partner, coupling 0.9792)
- **cosmic · exoplanet:** `GJ 3021 b ↔ HD 114783 b` (pilot_rhyme_aware_only_partner, coupling 0.9830)
- **cosmic · exoplanet:** `HD 114783 b ↔ GJ 3021 b` (pilot_rhyme_aware_only_partner, coupling 0.9830)
- **cosmic · exoplanet:** `HD 19994 b ↔ HD 82943 b` (pilot_rhyme_aware_only_partner, coupling 0.9746)
- **cosmic · exoplanet:** `HIP 5158 b ↔ HD 147018 c` (pilot_rhyme_aware_only_partner, coupling 0.9683)
- **cosmic · exoplanet:** `KOI-55 b ↔ V0391 Peg b` (pilot_rhyme_aware_only_partner, coupling 0.8567)
- **cosmic · exoplanet:** `HD 221287 b ↔ HD 33564 b` (pilot_rhyme_aware_only_partner, coupling 0.9898)
- **cosmic · exoplanet:** `HD 33564 b ↔ HD 221287 b` (pilot_rhyme_aware_only_partner, coupling 0.9898)
- **cosmic · exoplanet:** `61 Vir c ↔ HD 11964 c` (pilot_rhyme_aware_only_partner, coupling 0.9792)
- **cosmic · exoplanet:** `61 Vir d ↔ HD 69830 d` (pilot_rhyme_aware_only_partner, coupling 0.9594)
- … +652 more in DISCOVERY_CATALOG.json
