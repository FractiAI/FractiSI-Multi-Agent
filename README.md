# FractiSI Multi-Agent

### One shared world. Many agents. Coordinated work. Composed results.

**FractiSI** · flagship product **FractiSI Multi-Agent** · Local **Workstation** kit  
**Core technology:** Tiny Footprint · powered by **Tiny Gateway™**

[![Product](https://img.shields.io/badge/product-FractiSI%20Multi--Agent-c9a227)](./docs/product/PRODUCT.md)
[![Edition](https://img.shields.io/badge/edition-Community%20FREE-0b1424)](./docs/product/PRODUCT.md)
[![Site](https://img.shields.io/badge/site-fractisi.vercel.app-0b1424)](https://fractisi.vercel.app)
[![Paper](https://img.shields.io/badge/paper-Platform-0b1424)](./docs/product/FRACTISI_MULTI_AGENT_PLATFORM_ARCHITECTURE_2026-11.md)
[![Lab](https://img.shields.io/badge/lab-empirical%20suite-444)](https://github.com/FractiAI/tiny-oracle-lob-pilot)

---

## What is FractiSI Multi-Agent?

**FractiSI Multi-Agent** is FractiSI’s flagship installable platform for agentic engineering work. It sits **beside** Cursor, Claude Code, VS Code, and Git — it does not replace them.

### Why teams visit · Expedition 002 lab differentiators

| Differentiator | Flat / full-copy | FractiSI guided |
|------|------------------|-----------------|
| **Sees what flat models miss** (100 × 6-hop) | **0 / 100** solutions · chains · anomalies | **100 / 100** |
| **Converges on answers faster** | 6 rounds · 40 ops | **3 rounds (−50%)** · **6 ops (−85%)** |
| **Agent density per infra budget** | Full per-agent copy | Dup cut **89.6%–99.2%** · **36.91×–62.41×** |

These are the outcomes multi-agent teams come here for. Digital architectural lab (seed `20261105`) — not an LLM bake-off; LLM collective intelligence not yet demonstrated. Receipts: [`docs/product/expedition-002/`](./docs/product/expedition-002/) · [pricing](./product/pricing/).

**Tiny Footprint** is the Layer A execution core: one shared world (or shared organizational context) for many agents — template once, per-agent deltas, selective reconstruct. **DRAM concurrency** is the engine inside. Layers B–F add coordination, shared state, composition, Git awareness, and **optional** approval-gated deploy.

Agent fleets default to an expensive habit: **copy the shared world into every agent**, then collide at merge time. Compression shrinks each copy; it does not remove the copies. FractiSI Multi-Agent registers the world once, keeps per-agent difference compact, coordinates ownership, composes contributions into one result, and only publishes when you ask it to.

| | Without FractiSI Multi-Agent | With FractiSI Multi-Agent |
|--|------------------------------|---------------------------|
| Shared context | Reprinted per agent / session | Registered once (Tiny Footprint) |
| Parallel work | Branch-per-agent / silent overlap | Scoped worktrees + interference checks |
| Integration | Merge archaeology | Compose → validate → integrate → rollback |
| Ship | Often “whoever pushes first” | Approval-gated release (**optional** cloud preview) |
| Goal | — | Denser fleets · less duplicated effort · composed outcomes |

**Empirical companion:** [FractiAI/tiny-oracle-lob-pilot](https://github.com/FractiAI/tiny-oracle-lob-pilot) · `npm run multi-agent` · `npm run shine`  
**Platform architecture:** [docs/product/FRACTISI_MULTI_AGENT_PLATFORM_ARCHITECTURE_2026-11.md](./docs/product/FRACTISI_MULTI_AGENT_PLATFORM_ARCHITECTURE_2026-11.md)  
**Tiny Footprint product paper:** [docs/product/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md](./docs/product/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md) · live: [fractisi.vercel.app/library/papers/tiny-footprint-multi-agent](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/)  
**Expedition 002 · Beyond Memory:** [docs/product/FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md](./docs/product/FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md) · [library](https://fractisi.vercel.app/library/papers/fractisi-expedition-002-beyond-memory/) · [brochure](https://fractisi.vercel.app/docs/web/expedition-002-brochure.html)

This kit is the **Local / Workstation** edition (Community free). Server and Cloud editions share the same engine.

---

## Platform layers (Workstation 0.2)

| Layer | What it does |
|-------|----------------|
| **A · Tiny Footprint execution** | Shared templates, agent deltas, selective reconstruct |
| **B · Coordination** | Agent registry, task ownership, interference detection |
| **C · Shared state** | Project / module / contribution representation |
| **D · Composition** | Evaluate, validate, integrate, rollback contributions |
| **E · Git awareness** | Inspect repos; scoped workspaces (optional worktrees) |
| **F · Deploy capability** | Release candidates with mandatory approval — **use only when the workload should publish** |

Architecture: [docs/architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md](./docs/architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md) · Install detail: [docs/install/INSTALL.md](./docs/install/INSTALL.md) · API: [docs/reference/platform-api.md](./docs/reference/platform-api.md)

---

## Install and use (start here)

**Requirements**

| Path | Need |
|------|------|
| **Real workload** on your project (recommended) | **Git** + Node.js 18+ |
| **Optional cloud preview** | above + `VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN` |
| **Sandbox demo with live URL** | Git + Node 18+ + cloud token |

No Cursor key, no Claude key, no OpenAI key, no password vault for the platform path.

### Install (clone the kit once)

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
```

Open in Cursor / VS Code if you want — not required for CLI.

### Path A · Real workload on *your* repo (deploy optional)

Use this when you want FractiSI on an actual agentic project (Cursor / Claude Code sessions, real files). **Cloud deploy is optional** — not every workload should publish.

```bash
# from YOUR project directory
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --repo "$PWD"
```

What happens (no token):

1. Wires `.fractisi/` into your repo and opens Cursor/Claude-shaped agent worktrees  
2. Captures dirty files (or edits under `.fractisi/worktrees/<agent>`)  
3. Composes + validates contributions  
4. **Git-commits** the integrated result into *your* repository  

Optional — only if this workload should get a preview URL:

```bash
export VERCEL_TOKEN=…          # or FRACTISI_CLOUD_TOKEN · vercel.com/account/tokens
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --deploy --repo "$PWD"
```

Prepare worktrees before agents edit:

```bash
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --prepare --repo "$PWD"
# Point Cursor / Claude Code at .fractisi/worktrees/<agent>, make real edits, then:
node /path/to/FractiSI-Multi-Agent/scripts/tiny.mjs try --workload --repo "$PWD"
```

Guide written into your repo: `.fractisi/REAL_WORKLOAD.md`.

### Path B · Sandbox demo (kit-local)

Quick platform smoke test inside the kit clone (defaults to deploy; skip with `--no-deploy`):

```bash
export VERCEL_TOKEN=…          # omit if using --no-deploy
node scripts/tiny.mjs try
# or: node scripts/tiny.mjs try --no-deploy
```

Sandbox `try` opens two native agents, composes hello contributions, commits, and (unless `--no-deploy`) publishes a preview with **your** token.

### What to expect

After a real-workload or sandbox try, you get a **coordinated multi-agent workstation** beside the tools you already use:

| You get | Why it matters in real work |
|---------|-----------------------------|
| **One shared world, not N full copies** | Tiny Footprint keeps shared context once and stores per-agent deltas — denser fleets on the same machine budget |
| **Agents that do not trip over each other** | Coordination registers agents, tracks ownership, flags overlapping paths before merge day goes sideways |
| **Composed results, not a pile of branches** | Composition evaluates, validates, integrates, and can roll back into one coherent outcome |
| **Git-aware scoped workspaces** | Worktrees / scoped spaces so agents work in parallel without a branch-per-agent chaos tax |
| **Deploy only when you ask** | Layer F builds an approval-gated release candidate. Real workloads skip cloud by default; pass `--deploy` for a preview |
| **Beside Cursor / Claude Code / VS Code** | Message adapters normalize those runtimes. Your IDE, remotes, and CI stay yours |

**Day-two commands**

```bash
node scripts/tiny.mjs status
node scripts/tiny.mjs agents register worker-1 cursor
node scripts/tiny.mjs capture --all --repo "$PWD"
node scripts/tiny.mjs propose <agentId> path/to/file --file ./local
node scripts/tiny.mjs compose
node scripts/tiny.mjs repo integrate
node scripts/tiny.mjs deploy create    # optional
node scripts/tiny.mjs deploy approve <id>
node scripts/tiny.mjs deploy run <id>
node scripts/tiny.mjs doctor
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

**Honest limits:** lab receipts are structured-state / in-process unless a receipt says otherwise. Real-workload `try` performs real Git commits on your repo; `--deploy` performs a real Vercel publish when a token is present. Adapters normalize messages — they do not yet auto-drive live Cursor/Claude sessions. Not a GPU HBM CapEx guarantee or frontier LLM bake-off.

Full install guide: [docs/install/INSTALL.md](./docs/install/INSTALL.md) · [QUICKSTART.md](./QUICKSTART.md)

### Transparency

- **Your token stays yours.** Used only for Vercel API calls when you opt into `--deploy` / sandbox deploy. Never committed by `try`.  
- **Your remotes stay yours.** FractiSI coordinates beside Cursor, Claude Code, VS Code, GitHub/GitLab, and CI.  
- **Deploy is optional.** Real workloads compose + commit locally by default.  
- **Tiny Footprint** is Layer A. Layers B–F are the platform around it.

---

## One engine · three commercial editions

| Edition | Who | Where it runs |
|---------|-----|----------------|
| **Local (this repo)** | Developers & researchers | Your IDE / workstation — Community free |
| **Server** | Enterprises | Company GPU / agent hosts |
| **Cloud** | Hyperscale / GPU clouds | Provider infrastructure |

Product story: [PRODUCT.md](./docs/product/PRODUCT.md) · [plain language](./docs/product/SIMPLE.md) · [technology](./docs/research/TECH.md) · [whitepaper](./docs/research/TECH_PAPER.md)

Evidence: [results and claim ledger](./docs/benchmarks/RESULTS.md) · [reproducible study (PDF)](./output/pdf/tiny-footprint-workstation_combined.pdf) · [all documentation](./docs/README.md)

### Brochures & plainspeak (in this repo)

| Doc | Path |
|-----|------|
| **Plainspeak** | [docs/web/simple.html](./docs/web/simple.html) |
| **Tech brochure** | [docs/web/tech-brochure.html](./docs/web/tech-brochure.html) |
| **Print / PDF brochure** | [docs/web/commercial-brochure-print.html](./docs/web/commercial-brochure-print.html) |
| **Product hub snapshot** | [docs/web/product-hub.html](./docs/web/product-hub.html) |

Live site: https://fractisi.vercel.app · product: [/product/](https://fractisi.vercel.app/product/) · Multi-Agent paper: [/library/papers/tiny-footprint-multi-agent/](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/)

---

## IDE labs (Tiny Footprint)

Local memory/density labs inside the kit (no cloud token):

```bash
code .          # or: cursor .
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

`benchmark` writes results for this machine only. A lab that cannot run here reports `not_run`; verdict reads `incomplete`.

`npm test` runs the Node suite and repository gates without touching your receipts.

VS Code tasks: `.vscode/tasks.json` (Terminal → Run Task → `tiny: …`).

Optional real-model lab: `uv sync --group llm`, then `TINY_FOOTPRINT_FORCE_LLM_LAB=1 node scripts/tiny.mjs benchmark` (CPU, Apple MPS, NVIDIA, DirectML). Windows DirectML pin: `research/synthobs-tiny-gateway-rhyming-templates/requirements-directml.txt`.

---

## Multi-Agent lab (companion suite)

Shared-world vs naive per-agent copies (gzip residual honesty):

```bash
git clone https://github.com/FractiAI/tiny-oracle-lob-pilot.git
cd tiny-oracle-lob-pilot
npm test
npm run multi-agent
npm run shine
```

Labeled highlights: smaller-world packs still show **~42%** residual after gzip vs naive copies; world-dominated sweeps go much higher; selective nested coarse-only tasks cut runtime working-set bytes by **~99.5%**. Keep the after-gzip / lab-proxy qualifier.

---

## Join the industry-wide testing initiative

We invite infrastructure teams, cloud operators, accelerator partners, and AI-serving engineers to validate FractiSI Multi-Agent on real hardware.

```bash
node scripts/tiny.mjs join
```

### Share your results (opt-in)

When you **select share**, the kit packages latest benchmark receipts (plus hostname, platform, Node version) and **opens mail to `valetpru@gmail.com`**. Attach the JSON packet path the kit prints (mailto cannot attach files). With SMTP on Windows, the kit can send + attach. Decline → contact details only.

```bash
node scripts/tiny.mjs join
node scripts/tiny.mjs report --share
node scripts/tiny.mjs share
```

- Default recipient: **valetpru@gmail.com** (packet under `benchmarks/reports/share-packets/`)  
- Optional SMTP (Windows): `TINY_FOOTPRINT_SMTP_HOST`, `TINY_FOOTPRINT_SMTP_USER`, `TINY_FOOTPRINT_SMTP_PASS`, `TINY_FOOTPRINT_SMTP_FROM`  
- Override: `TINY_FOOTPRINT_SHARE_EMAIL`  

Details: [docs/product/VALIDATION.md](./docs/product/VALIDATION.md)

---

## Repository layout

```
FractiSI-Multi-Agent/          ← GitHub repo · FractiSI Multi-Agent kit (Tiny Footprint core)
├── src/
│   ├── core/ engine/ sdk/ experiments/ labs/ benchmarks/
│   ├── analysis/ manuscript/ pipeline/ verification/ gates/
│   ├── platform/         ← Multi-Agent layers A–F · try / workload / deploy
│   ├── cli/ share/ reporting/ workloads/ docs_tools/
│   └── tiny_footprint_labs/
├── tests/ scripts/ benchmarks/ output/ docs/
├── research/synthobs-tiny-gateway-rhyming-templates/
├── tiny-footprint/ tiny-gateway/ workloads/ media/
└── index.html, company/, css/, library/, open/, product/, recruit/   ← FractiSI website
```

Every folder has a `README.md` for people and an `AGENTS.md` for agents.

---

## What the evidence shows

### Multi-Agent product receipts (companion lab)

From [tiny-oracle-lob-pilot](https://github.com/FractiAI/tiny-oracle-lob-pilot) (`npm run multi-agent` · `npm run shine`):

| Evidence | Number | Meaning |
|----------|-------:|---------|
| Smaller-world shared pack vs naive copies | **~42%** residual after gzip | Compression alone leaves a large cross-copy tax |
| Sweep median when world dominates | **~98%** residual after gzip | World ≫ per-agent state |
| Selective nested coarse-only task | **~99.5%** less runtime bytes | Nested vectors as DRAM/runtime win |
| Flagship 256 agents · large world | **~99%** resident proxy · **≫10×** density arithmetic | Lab proxies — not live HBM attestation |

### Workstation serving-memory receipts (this kit)

<!-- BEGIN GENERATED EVIDENCE -->
**In short:** sharing a prompt prefix across sessions is the one thing here that performs, and production prefix caches already do it. The rhyming engine does not beat a plain object reference in memory, and it is slower to rebuild a session. [The results page](./docs/benchmarks/RESULTS.md) has the short answer with its numbers.

Generated from the receipts in [`output/data/`](./output/data/README.md). Measured values are from **Intel(R) Xeon(R) Processor**. [Full results and the claim ledger](./docs/benchmarks/RESULTS.md).

- **Representation bytes** (deterministic): the published aggregate reproduces at **84.5%**. It is 74.3% with equal weights and 77.0% over lossless workloads, against a target of 80%.
- **Live memory** (measured, 1,024 sessions sharing a system prompt): JSON predicts 49.5% and the V8 heap falls **32.8%**. A plain object reference reaches 32.9%.
- **Same shape, different words** (measured): JSON predicts 49.8% and the shipped engine's heap shows **13.2%**. A tighter encoding of the same idea reaches 24.4%, level with a plain reference at 28.9%.
- **In-process latency** (measured): materializing a session takes 1.01× to 1.62× the time of reading a duplicated store.
- **Real models** (measured): reusing a shared prefix speeds prefill by **1.34× to 3.50×**, with decode at 0.98× to 1.03×. A production prefix cache provides the same mechanism.
- **Key-value residency** (measured, `distilgpt2` on MPS): **84.4%** on the device allocator, 27.3% once weights are counted.
- **Rhymes on real tensors** (measured, `distilgpt2`): with 12.5% of tokens changed, 14.6% of KV cells repeat, and resuming from the other prompt's cache moves logits by 3.72. The simulated 34.3% H100 saving for rhymes has no measurement behind it.
- **Not established:** a reduction of 80% in DRAM or accelerator memory for AI serving.
<!-- END GENERATED EVIDENCE -->

Your `tiny benchmark` and `tiny report` produce receipts for **your** machine. These figures are **not** CapEx guarantees, **not** datacenter HBM identity, and **not** hosted frontier-vendor attestations.

**H100 simulation (not live silicon):** when sessions share organization but not exact wording, a production prefix cache cannot share and the Tiny Footprint template+delta residency hypothesis cuts KV about **34%** versus that prefix cache (~**1.52×** materialize bandwidth proxy on the published H100 SXM profile). When the exact prefix is identical, Tiny matches the prefix cache. The real-tensor line above shows what a measurement found.

### Reproduce it

```bash
uv sync --group dev --group figures --group llm
npm test && uv run pytest

# Re-derive analysis, figures, manuscript and results from the committed receipts
node scripts/run_pipeline.mjs --only analysis,figures,hydrate,docs
node scripts/verify_project.mjs --before-render
```

Rendering the PDF needs a [docxology/template](https://github.com/docxology/template) checkout in `TINY_TEMPLATE_ROOT`, plus `pandoc`, `pandoc-crossref` and `xelatex`. With those in place, `node scripts/run_pipeline.mjs --rebuild` goes through to the validated PDF. Running `node scripts/run_pipeline.mjs` with no flags measures again and replaces the receipts, so the values become your machine's. It checks what its stages need before it changes anything.

[Running the benchmarks](./docs/benchmarks/running.md) covers each stage and connecting [docxology/template](https://github.com/docxology/template), which renders the PDF.

---

## Commercial editions · freemium packaging

Professional infrastructure — not a cheap Cursor/Claude substitute. **Charge for coordinated agent capacity**, not ideas or command counts.

| Edition | Price | Primary customer |
|---------|------:|------------------|
| **Community** | Free | Individual developer |
| **Developer Pro** | **$39 / month** | Professional developer |
| **Team** | **$149 / month** | Engineering team |
| **Server / Enterprise** | **From $12,000 / year** | Enterprise |
| **Cloud Platform** | Custom | Infrastructure provider |

Primary billing metric: **concurrent coordinated agents** (registered agents are generous; human seats are included allowances). Deploy remains **optional**. Community is genuinely useful with no crippled trial.


Full page: [/product/pricing/](./product/pricing/) · [pricing & packaging spec](./docs/product/FRACTISI_MULTI_AGENT_PRICING_PACKAGING_2026-11.md)  
Hub: https://fractisi.vercel.app/product/ · https://fractisi.vercel.app/product/pricing/

**Product name lock:** customers hear **FractiSI Multi-Agent**. Tiny Footprint is the Layer A core. DRAM is the engine. SQL/network are later adapters — not separate diluted SKUs. Proposed launch prices — not established market rates; paid tiers sell when features are operational.

---

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks and change rules. Report vulnerabilities privately using [SECURITY.md](./SECURITY.md).

## Support

- Contact / validation / shared results: **valetpru@gmail.com**  
- SING 13 monorepo mirror: `products/tiny-footprint-workstation/` in [psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

→ ∞^∞

---

## FractiSI site

Marketing site for **FractiSI Multi-Agent** — product hub, research, library, open, company, recruit — lives at the repo root and deploys to https://fractisi.vercel.app (also mirrored to [FractiAI/fractisi](https://github.com/FractiAI/fractisi)).

- Product: `/product/`
- Platform paper: `/library/papers/fractisi-multi-agent-platform/` (when published on site)
- Multi-Agent / Tiny Footprint paper: `/library/papers/tiny-footprint-multi-agent/`
- Recruit: `/recruit/`
