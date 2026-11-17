# E12 — Collaboration synergy results

Protocol: `E12_COLLAB_SYNERGY.md` (+ Amendment A).

## Question

Does a collaborating team beat the **sum of independent parts** (OR of solos) and the **best solo**?

## Deterministic architecture control (N=100)

| SOLO_A/B | INDEPENDENT_OR | SILO (wrong join) | COLLAB_AWARE |
|---:|---:|---:|---:|
| 0% | 0% | 0% | **100%** |

Whole > sum of parts at the protocol level: parts cannot form the joined token; shared join rule can.

## Real HotpotQA — answer EM (N=30, Qwen2.5-1.5B)

| MAX_SOLO / OR | SILO_TEAM | COLLAB_AWARE |
|---:|---:|---:|
| 46.7% | 36.7% | 26.7% |

**No synergy** on raw answer EM (answers often sit inside one passage, so OR is strong; weak synthesizer underperforms).

## Real HotpotQA — complementary title-pair (N=30, rescored)

| SOLO / OR | SILO_TEAM | COLLAB_AWARE |
|---:|---:|---:|
| 3.3% | 20% | **30%** |

**Synergy yes:** COLLAB − OR ≈ +0.27, CI excludes 0; also beats best solo. This is the fair complementarity task (each agent holds one supporting passage; the pair is the joint product).

## Plain verdict

- **Better collaboration / whole > sum of parts:** **yes** on the complementary title-pair task + deterministic control.  
- **Not shown:** collab surplus on answer-string EM with this small model (Groq unavailable this run).  
- Together with E9–E11: relational/shared structure can make agents effectively smarter; E12 shows that for **multi-agent assembly of complementary information**.

→ ∞^∞
