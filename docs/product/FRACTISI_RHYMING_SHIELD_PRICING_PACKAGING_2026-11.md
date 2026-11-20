# FractiSI Multiagent Rhyming Shield · Security Add-on Pricing & Packaging

**Document ID:** `FRACTISI-RHYMING-SHIELD-PRICING-PACKAGING-2026-11`  
**Status:** Proposed launch pricing · commercial specification · November 2026  
**Product:** FractiSI Multiagent Rhyming Shield (separate security add-on)  
**Base product:** FractiSI Multi-Agent  
**Live pages:** [`/product/rhyming-shield/`](../../product/rhyming-shield/index.html) · [`/product/rhyming-shield/pricing/`](../../product/rhyming-shield/pricing/index.html)

---

## Positioning

**FractiSI Multiagent Rhyming Shield** is **Rhyming Protection** against malicious agents and malicious information in a shared world. It is a **separate add-on**, not a diluted Multi-Agent SKU and not a replacement for IAM, network firewalls, or cloud provider security.

**Commercial promise:**

> Protect the shared world. Quarantine poisoned claims. Keep honest disagreement open.

**Packaging principle:** price the Shield ladder **self-similar** to FractiSI Multi-Agent (same dollar rails), as **top-tier security packages** sold beside capacity — not as per-attack or per-quarantine metering.

| Shield package | Multi-Agent twin | **Add-on price** | Requires Multi-Agent |
|----------------|------------------|-----------------:|----------------------|
| Soft Story Lab | Community | **Free** | Community+ |
| Developer Pro | Developer Pro | **$59 / month** | Developer Pro+ |
| Team | Team | **$299 / month** | Team+ |
| Server / Enterprise | Server / Enterprise | **From $30,000 / year** | Enterprise |
| Cloud | Cloud Platform | **Custom** | Cloud |

These are **proposed commercial prices**, not validated willingness-to-pay figures.

---

## What customers buy

| Package | What they buy |
|---------|----------------|
| Soft Story Lab | Access to Adversarial World Soft Story suite, historical metadata replay, docs |
| Developer Pro Shield | Personal Rhyming Protection on a workstation fleet |
| Team Shield | Organizational shared-world Rhyming Protection |
| Enterprise Shield | Top-tier security package + support on customer-owned servers |
| Cloud Shield | Custom Rhyming Protection license on customer / provider cloud |

**Not sold:** model tokens, per-quarantine fees, live red-team against third parties, or FractiSI-hosted infrastructure.

---

## Feature list (add-on)

- Malicious-agent Soft Story containment (attacks A–J class)
- Malicious-information filter (false observation, memory poison, fake rhyme, goal hijack, privilege grab)
- Relational rhyme independence checks (Sybil / false consensus)
- Provenance + quarantine + selective rollback
- Historical Soft Story replay from public InjecAgent **metadata** (tools + type + instruction fingerprint; prompts not vendored)
- Goldilocks openness (legitimate disagreement + truth-without-rhyme)

Lab grounding: `research/adversarial-world/` · paper `/library/papers/adversarial-world/`.

---

## Packaging rules

1. **Separate add-on** — listed beside Multi-Agent, not buried as a free Enterprise bullet alone.  
2. **Self-similar dollars** — Shield Pro/Team/Enterprise match Multi-Agent Pro/Team/Enterprise amounts.  
3. **Base edition gate** — Shield tier requires Multi-Agent edition ≥ Shield tier.  
4. **Community Soft Story Lab stays free** — no credit card to read the paper or run the Soft Story suite.  
5. **Don’t charge per attack** — sell protection capacity/capability.  
6. **Honesty** — Soft Story lab ≠ production security certification; ENGINE_SHELF pin deferred for Adversarial World.

---

## Entitlement mapping

Runtime labels in `src/platform/entitlements.mjs` → `ADDONS.rhyming_shield`:

| Package | Entitlement id |
|---------|----------------|
| Soft Story Lab | `rhyming_shield_lab` |
| Developer Pro | `rhyming_shield_developer_pro` |
| Team | `rhyming_shield_team` |
| Enterprise | `rhyming_shield_enterprise` |
| Cloud | `rhyming_shield_cloud` |

Capability flag: `rhyming_shield` (plus tier-specific governance labels).

---

## Related surfaces

- Product: `/product/rhyming-shield/`  
- Pricing: `/product/rhyming-shield/pricing/`  
- Multi-Agent pricing twin: `/product/pricing/`  
- Spec twin: `FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md`

→ ∞^∞
