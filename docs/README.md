# Documentation · FractiSI Multi-Agent

**FractiSI Multi-Agent** is the flagship product. **Tiny Footprint** is the Layer A execution core (shared world once, per-agent deltas). This folder holds the product story, architecture, install guide, benchmark method and results, manuscript, and contributor guides.

**Root product README (rich):** [`../README.md`](../README.md)

## Start here

| You want to | Read |
|---|---|
| **Install and use** (real workload · optional deploy) | [install/INSTALL.md](install/INSTALL.md) · [../QUICKSTART.md](../QUICKSTART.md) · [../README.md](../README.md) |
| **Freemium pricing & packaging** | [product/FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md](product/FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md) · [/product/pricing/](../product/pricing/) |
| Understand the product in plain language | [product/SIMPLE.md](product/SIMPLE.md), then [product/PRODUCT.md](product/PRODUCT.md) |
| Platform architecture (layers A–F) | [product/FRACTISI_MULTI_AGENT_PLATFORM_ARCHITECTURE_2026-11.md](product/FRACTISI_MULTI_AGENT_PLATFORM_ARCHITECTURE_2026-11.md) · [architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md](architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md) |
| See what the evidence shows | [benchmarks/RESULTS.md](benchmarks/RESULTS.md) |
| Read the full Tiny Footprint study | [the rendered manuscript](../output/pdf/tiny-footprint-workstation_combined.pdf), from [manuscript/](manuscript/README.md) |
| Run benchmarks on your machine | [benchmarks/running.md](benchmarks/running.md) |
| Use the CLI or SDK | [reference/cli.md](reference/cli.md), [reference/sdk.md](reference/sdk.md) |
| Join validation | [product/VALIDATION.md](product/VALIDATION.md) |

## Try paths (summary)

```bash
# Real project — Git only (deploy optional)
node scripts/tiny.mjs try --workload --repo "$PWD"

# Optional cloud preview
export VERCEL_TOKEN=…
node scripts/tiny.mjs try --workload --deploy --repo "$PWD"

# Sandbox demo inside this kit
node scripts/tiny.mjs try            # deploys by default
node scripts/tiny.mjs try --no-deploy
```

## Folder map

| Path | What it is |
|------|------------|
| `install/` | User install · real workload · optional deploy |
| `product/` | PRODUCT · SIMPLE · platform architecture · Expedition 002 |
| `architecture/` | Platform assessment · overview · source map |
| `benchmarks/` | RESULTS · methodology · running |
| `reference/` | CLI · SDK · configuration · platform API |
| `research/` | TECH · TECH_PAPER |
| `web/` | Brochures · plainspeak HTML |
| `manuscript/` | Study source for PDF render |
| `development/` | Contributor guides |

→ ∞^∞
