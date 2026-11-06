# FractiSI Multi-Agent · Freemium Pricing & Packaging

**Document ID:** `FRACTISI-MULTI-AGENT-PRICING-PACKAGING-2026-11`  
**Status:** Proposed launch pricing · commercial specification  
**Product:** FractiSI Multi-Agent  
**Live page:** [`/product/pricing/`](../../product/pricing/index.html) · site https://fractisi.vercel.app/product/pricing/

---

## Positioning

FractiSI is a **professional infrastructure product** with a genuinely useful Community edition — not a low-cost alternative to Cursor, Claude Code, or other agent platforms.

**Commercial principle:** charge for the **capacity to coordinate productive agent fleets**, not for access to the underlying idea or the number of times someone runs a command.

FractiSI creates value by allowing more agents to work against **one shared world**, coordinate contributions, and produce **integrated outcomes**. Commercial value increases with the **size and complexity of the workload**.

**Recommended positioning line:** FractiSI is not another AI coding assistant. It is the coordination and shared-world infrastructure that makes larger, more productive agent fleets possible.

**Strategic metric:** agent density per infrastructure budget — more productive agents on the same memory, compute, and operating budget.

---

## Recommended pricing (four tiers + Cloud)

These are **proposed launch prices**, not claims of established market rates.

| Edition | Price | Primary customer |
|---------|------:|------------------|
| **Community** | Free · $0 | Individual developer / researcher |
| **Developer Pro** | **$39 / month** | Professional developer |
| **Team** | **$149 / month** | Engineering team |
| **Server / Enterprise** | **From $12,000 / year** | Enterprise |
| **Cloud Platform** | Custom | Hyperscaler / GPU operator / large agent platform |

### Free · Community — open-source entry point

For individual developers, researchers, and experimentation.

- Local workstation installation  
- Tiny Footprint execution core  
- Shared-world registration and reconstruction  
- Basic agent registry and coordination  
- Local composition and validation  
- Git integration  
- Local benchmarks and reports  
- Community documentation  

**No artificial expiration or crippled trial.**

### Paid · Developer Pro — $39 / month

For developers running serious multi-agent workloads.

- Everything in Community  
- Up to **8** registered agents  
- Up to **4** concurrent coordinated agents  
- Multiple project workspaces  
- Advanced interference detection  
- Composition policies and validation gates  
- Rollback and contribution history  
- Advanced workload analytics  
- Benchmark comparisons and exportable receipts  
- Priority updates and professional support  

### Paid · Team — $149 / month

For engineering teams coordinating shared agent fleets.

- Everything in Developer Pro  
- Up to **32** registered agents  
- Up to **16** concurrent coordinated agents  
- Shared team workspaces  
- Team-level permissions and ownership  
- Cross-project coordination  
- Centralized policies and audit receipts  
- Approval-gated integration and deployment  
- Team analytics and utilization reporting  
- Team administration and priority support  

### Enterprise · Server / Enterprise — from $12,000 / year

For companies operating substantial agent infrastructure.

- Everything in Team  
- Dedicated server deployment  
- Custom agent capacity  
- Organization-wide shared-world infrastructure  
- Enterprise identity and access integration  
- Advanced governance and auditability  
- Deployment and integration controls  
- Private support and onboarding  
- Custom service-level agreements  
- Architecture and capacity planning  

### Cloud Platform — custom pricing

For hyperscalers, GPU operators, infrastructure providers, and large agent platforms.

- Provider-scale agent coordination  
- Multi-tenant shared-world architecture  
- Custom capacity and infrastructure economics  
- Integration and licensing arrangements  
- Enterprise-wide or infrastructure-wide deployment  

---

## Why these prices

The competitive market is **professional developer infrastructure and agentic engineering** — not inexpensive plugins.

| Comparable product | Published pricing (reference) |
|--------------------|-------------------------------|
| Cursor Premium | ~$30 / month |
| GitHub Copilot Pro+ | ~$39 / month |
| Claude Pro | ~$20 / month |
| Claude Team Standard | ~$20–25 / user / month |
| Cursor Teams | ~$30+ / user / month |

**Distinction:** Cursor and Claude primarily sell AI development experiences and model usage. GitHub sells developer productivity and agent access. **FractiSI sells the infrastructure that coordinates work across agents**, independently of which models or IDEs are used. That justifies a separate infrastructure subscription.

Do **not** price FractiSI at $9 or $19 as a lure. **$39** places Developer Pro beside established professional developer products; **$149** Team sells organizational capability, not a cheap multi-seat bundle.

---

## Pricing metric: coordinated agent capacity

Do **not** make human seats the primary pricing unit. Economic value tracks how many agents work **concurrently** in a coordinated shared world.

| Metric | Commercial treatment |
|--------|----------------------|
| Human operators | Included allowance by edition |
| Registered agents | Generous allowance; not the main billing unit |
| **Concurrent coordinated agents** | **Primary capacity dimension** |

An organization may have 100 registered agents and only 12 working simultaneously — charging for all 100 discourages adoption without reflecting demand. Concurrent coordination capacity is what customers should scale.

---

## What differentiates each paid edition

| Stage | Edition | Responsibility |
|-------|---------|----------------|
| Discover and build | Community | Download, install, experiment, benchmark, real local workloads |
| Operate | Developer Pro | Larger fleet, multiple projects, interference, reliable composition |
| Govern | Team | Multi-person fleets, ownership, policies, integration/release control |
| Institutionalize | Enterprise | Own infra, identity, governance, capacity, deployment, SLAs |

Natural progression: individual adoption → professional use → organizational coordination → infrastructure licensing.

---

## Packaging rules

1. **Community must be genuinely useful** — do not cripple Tiny Footprint, withhold the core engine, or require a credit card. Community demonstrates the architecture and permits meaningful local workloads.  
2. **Don’t charge for model tokens** — customers bring Cursor, Claude Code, OpenAI, or other access; provider bills stay separate. FractiSI charges for coordination infrastructure.  
3. **Don’t charge per agent registration** — charge by concurrent coordinated capacity and organizational capabilities.  
4. **Don’t make deployment mandatory** — local execution, composition, and Git integration remain useful without a cloud subscription.  
5. **Make enterprise licensing valuable** — private deployment, governance, controls, support, and capacity justify larger contracts.

---

## Launch-stage adjustment (honesty)

There is a distinction between the **commercial architecture** and what **Workstation 0.2** can currently substantiate. Documentation honestly notes that adapters do not yet automatically drive live Cursor or Claude sessions; some organizational controls remain planned platform work.

**Launch sequence**

1. Keep the four-tier (+ Cloud) commercial structure.  
2. Make **Community** available immediately.  
3. Introduce **Developer Pro** when paid-only features are operational and tested.  
4. Introduce **Team** when multi-user administration and governance work.  
5. Sell **Enterprise** through validated deployment and integration contracts.  
6. **Don’t charge customers for roadmap promises.**  

Benchmark evidence must keep laboratory qualifications; customers should reproduce results on their own machines.

---

## Annual pricing and expansion

Offer annual commitments at the **same effective monthly rate** initially (no heavy discount theater). Annual customers receive:

- Defined support relationship  
- Capacity planning  
- Priority product updates  
- Annual architecture review  
- Predictable renewal pricing  

Reserve the right to introduce additional **concurrent-agent capacity packs** as real workloads establish economics.

---

## Entitlement mapping (repository)

Runtime labels in `src/platform/entitlements.mjs`:

| Commercial edition | Entitlement id | Notes |
|--------------------|----------------|-------|
| Community | `community` (alias `core`) | Unrestricted local discovery; no paid gates required |
| Developer Pro | `developer_pro` (alias `professional`) | Capacity + pro tooling gates when activated |
| Team | `team` | Multi-user / governance gates when activated |
| Server / Enterprise | `enterprise` | Self-host, RBAC, deploy, audit |
| Cloud Platform | `cloud` | Provider-scale packaging label |

Billing architecture (subscriptions, seats vs concurrent capacity meters, upgrade path) lives with this spec; enforcement ships when the corresponding paid features are product-ready.

---

## Competitive watch

Periodically review agent-infrastructure and professional developer pricing (Cursor, Copilot, Claude Team, emerging coordination layers). Adjust proposed launch prices only with documented rationale — never to race a $9 floor.

---

## Lab evidence · faster convergence + what flat models miss

Community packaging must surface the same Expedition 002 receipts that justify denser fleets. Seed `20261105`. Digital architectural lab (structured-state + relationship-guided retrieval) — **not** live GPU HBM attestation, **not** an LLM multi-agent bake-off.

| Test | Flat / full-copy | FractiSI guided | Commercial meaning |
|------|------------------|-----------------|--------------------|
| **E2 · Discovery & solutions** (100 scenarios × 6-hop) | 0/100 solutions · 0/100 chain discovery · 0/100 anomalies | **100/100** solutions · chains · anomalies | Shared-world guidance sees relationships and answers the flat skim never assembles in budget |
| **E2 · Architectural convergence** | 6 propagation rounds · mean 40 ops | **3 rounds (−50%)** · mean 6 ops (**−85%**) | Faster convergence on the answer path under the same constrained budget |
| **E1 · Resource vs full-copy** | Full per-agent copy | Dup cut **89.6%–99.2%** · speedup **36.91×–62.41×** | Agent density per infrastructure budget |

Receipts: [`expedition-002/empirical_report.md`](./expedition-002/empirical_report.md) · paper [`FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md`](./FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md) · brochure `/docs/web/expedition-002-brochure.html`.

Honesty: selective reconstruction may be slower than direct shared lookup; **LLM collective intelligence — not demonstrated**.

---

## Related surfaces

- Product hub: `/product/`  
- Pricing page: `/product/pricing/`  
- Install (deploy optional): [`../install/INSTALL.md`](../install/INSTALL.md)  
- Root README commercial section  
- Expedition 002 lab board + paper  
- Platform architecture paper  

→ ∞^∞
