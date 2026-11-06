<!-- try path -->

## Freemium pricing

See [FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md](./FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md) and live [/product/pricing/](/product/pricing/). Community free · Developer Pro $39/mo · Team $149/mo · Enterprise from $12k/yr.

## FractiSI Multi-Agent platform

As of Workstation **0.2**, Tiny Footprint Multi-Agent is the **core execution technology** inside the unified **FractiSI Multi-Agent** product (coordination, composition, Git awareness, deploy approvals). Commercial tiers (Core / Professional / Enterprise) package capabilities — they are not separate products.

See [architecture assessment](../architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md).

# Tiny Footprint Multi-Agent · Product

## Install and use

**Required:** Git + cloud token (`VERCEL_TOKEN` / `FRACTISI_CLOUD_TOKEN`) + Node 18+.

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
export VERCEL_TOKEN=…
node scripts/tiny.mjs try
```

**What to expect:** shared-world density (Tiny Footprint), coordination, composition, Git worktrees, approval-gated live preview — beside Cursor / Claude Code / VS Code.

Full guide: [../install/INSTALL.md](../install/INSTALL.md) · README “Install and use (start here)”.


**One shared world. Many agents.**  
Powered by Tiny Gateway™ · FractiSI / FractiAI

## What it is

**FractiSI Multi-Agent** is the flagship product: software installed **alongside** the agent runtime or serving stack you already run—not a new computer, not a stack replacement. One shared world (or shared organizational context) for many agents; per-agent deltas; selective reconstruct. **DRAM concurrency** is the engine inside.

## One engine · three editions

| Edition | Customer | Installed on | Pricing |
|---------|----------|--------------|---------|
| **Local · Workstation Kit** | Developers / researchers | Personal computer | Free / Pro subscription |
| **Server** | Enterprises | Company GPU / agent hosts | Annual license |
| **Cloud · Platform** | Cloud / GPU operators | Provider infrastructure | Negotiated |

## Central idea

Without Tiny Footprint, each agent often retains a full copy of the shared world.  
With Tiny Footprint Multi-Agent, the world is registered once; each agent keeps compact differences; selective reconstruction builds the working set.

Paper: [TINY_FOOTPRINT_MULTI_AGENT_2026-11.md](./TINY_FOOTPRINT_MULTI_AGENT_2026-11.md) · Empirical suite: [FractiAI/tiny-oracle-lob-pilot](https://github.com/FractiAI/tiny-oracle-lob-pilot)

## First download

This repository is **Workstation 0.2** — the starting point for all three markets.

Commercial hub: https://fractisi.vercel.app/product/  
Multi-Agent paper: https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/  
Plainspeak (in-repo): [docs/web/simple.html](../web/simple.html)
