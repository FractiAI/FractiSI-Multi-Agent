# FractiSI Multi-Agent · Product

**Product name lock:** customers hear **FractiSI Multi-Agent**. **Tiny Footprint** is the Layer A execution core (powered by **Tiny Gateway™**). DRAM concurrency is the engine. SQL/network adapters are later — not separate diluted SKUs.

## Positioning

One shared world. Many perspectives. New discoveries. Faster convergence. Better decisions.

FractiSI Multi-Agent is shared-world **intelligence and coordination** infrastructure for agent fleets — beside the IDE/runtime you already run. It is not a low-cost Cursor/Claude substitute.

## Freemium pricing

See [FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md](./FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md) and live [/product/pricing/](/product/pricing/).

| Edition | Price | What you buy |
|---------|------:|--------------|
| **Community** | Free | Access to the architecture |
| **Developer Pro** | **$59 / month** | Personal multi-agent intelligence · up to 8 concurrent |
| **Team** | **$299 / month** | Collective discovery and decisions · up to 32 concurrent |
| **Server / Enterprise** | **From $30,000 / year** | Organizational intelligence infrastructure |
| **Cloud Platform** | Custom | Provider-scale intelligence infrastructure |

## Install and use

**Real workload (recommended):** Git + Node 18+. **Optional cloud preview:** add `VERCEL_TOKEN` / `FRACTISI_CLOUD_TOKEN`.

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
node scripts/tiny.mjs try --workload --repo "$PWD"
# Optional preview: add --deploy and VERCEL_TOKEN
```

**What to expect:** shared-world density (Tiny Footprint), coordination, composition, Git worktrees, optional approval-gated live preview — beside Cursor / Claude Code / VS Code.

Full guide: [../install/INSTALL.md](../install/INSTALL.md) · root README.

## Platform (Workstation 0.2)

Layers A–F: Tiny Footprint execution · coordination · shared state · composition · Git awareness · optional deploy.

See [architecture assessment](../architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md) · platform paper [/library/papers/fractisi-multi-agent-platform/](/library/papers/fractisi-multi-agent-platform/).

## One engine · three editions

| Edition | Customer | Installed on |
|---------|----------|--------------|
| **Local · Workstation** | Developers / researchers | Personal computer |
| **Server** | Enterprises | Company GPU / agent hosts |
| **Cloud · Platform** | Cloud / GPU operators | Provider infrastructure |

## Central idea

Without FractiSI Multi-Agent, each agent often retains a full copy of the shared world, then collides at merge. With it, the world is registered once (Tiny Footprint); each agent keeps compact differences; selective reconstruction builds the working set; coordination and composition produce one shippable result.

Shared-world / gzip / density companion paper: [/library/papers/tiny-footprint-multi-agent/](/library/papers/tiny-footprint-multi-agent/) · Empirical suite: [FractiAI/tiny-oracle-lob-pilot](https://github.com/FractiAI/tiny-oracle-lob-pilot)

Commercial hub: https://fractisi.vercel.app/product/

→ ∞^∞
