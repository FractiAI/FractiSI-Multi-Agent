# FractiSI Multi-Agent

### One shared world. Many agents. Coordinated work. Composed results.

**FractiSI** · flagship product **FractiSI Multi-Agent** · Local **Workstation** kit  
**Core technology:** Tiny Footprint · powered by **Tiny Gateway™**

[![Product](https://img.shields.io/badge/product-Tiny%20Footprint%20Multi--Agent-c9a227)](./docs/product/PRODUCT.md)
[![Edition](https://img.shields.io/badge/edition-Community%20FREE-0b1424)](./docs/product/PRODUCT.md)
[![Site](https://img.shields.io/badge/site-fractisi.vercel.app-0b1424)](https://fractisi.vercel.app)
[![Paper](https://img.shields.io/badge/paper-Multi--Agent-0b1424)](./docs/product/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md)
[![Lab](https://img.shields.io/badge/lab-empirical%20suite-444)](https://github.com/FractiAI/tiny-oracle-lob-pilot)


## Platform layers (Workstation 0.2)

| Layer | What it does |
|-------|----------------|
| **A · Tiny Footprint execution** | Shared templates, agent deltas, selective reconstruct |
| **B · Coordination** | Agent registry, task ownership, interference detection |
| **C · Shared state** | Project / module / contribution representation |
| **D · Composition** | Evaluate, validate, integrate, rollback contributions |
| **E · Git awareness** | Inspect repos; scoped workspaces (optional worktrees) |
| **F · Deploy capability** | Release candidates with mandatory approval |

```bash
node scripts/tiny.mjs init
node scripts/tiny.mjs agents register worker-1 cursor
node scripts/tiny.mjs status
node scripts/tiny.mjs coord-bench
```

Architecture assessment: [docs/architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md](./docs/architecture/FRACTISI_MULTI_AGENT_PLATFORM_ASSESSMENT_2026-11.md) · Install: [docs/install/INSTALL.md](./docs/install/INSTALL.md) · API: [docs/reference/platform-api.md](./docs/reference/platform-api.md)


---

## What is Tiny Footprint Multi-Agent?

**Tiny Footprint Multi-Agent** is FractiSI’s product: one shared world (or shared organizational context) for many agents — template once, per-agent deltas, selective reconstruct. **DRAM concurrency** is the engine inside. Install it **beside** the agent runtime / serving stack you already run.

Agent fleets default to an expensive habit: **copy the shared world into every agent**. Compression shrinks each copy; it does not remove the copies. This kit is the Local / Workstation edition of that product.

| | Without Tiny Footprint Multi-Agent | With Tiny Footprint Multi-Agent |
|--|------------------------------------|--------------------------------|
| Shared context | Reprinted per agent / session | Registered once |
| Per-agent state | Full world + local | Compact deltas |
| Goal | — | Less resident memory · higher agent density |

**Empirical companion:** [FractiAI/tiny-oracle-lob-pilot](https://github.com/FractiAI/tiny-oracle-lob-pilot) · `npm run multi-agent` · `npm run shine`  
**Paper:** [docs/product/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md](./docs/product/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md) · live: [fractisi.vercel.app/library/papers/tiny-footprint-multi-agent](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/)  
**Expedition 002 · Beyond Memory:** [docs/product/FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md](./docs/product/FRACTISI_EXPEDITION_002_BEYOND_MEMORY_2026-11.md) · [library paper](https://fractisi.vercel.app/library/papers/fractisi-expedition-002-beyond-memory/) · [brochure](https://fractisi.vercel.app/docs/web/expedition-002-brochure.html)

The Workstation also measures classic serving-memory cases (exact prefix sharing, organizational rhyme). See [RESULTS.md](./docs/benchmarks/RESULTS.md).

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

Open in a browser from `docs/web/`:

| Doc | Path |
|-----|------|
| **Plainspeak** | [docs/web/simple.html](./docs/web/simple.html) |
| **Tech brochure** | [docs/web/tech-brochure.html](./docs/web/tech-brochure.html) |
| **Print / PDF brochure** | [docs/web/commercial-brochure-print.html](./docs/web/commercial-brochure-print.html) |
| **Product hub snapshot** | [docs/web/product-hub.html](./docs/web/product-hub.html) |

Live site: https://fractisi.vercel.app · product: [/product/](https://fractisi.vercel.app/product/) · Multi-Agent paper: [/library/papers/tiny-footprint-multi-agent/](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/)

---

## IDE install (5 commands)

**Requirements:** Git · Node.js 18+ · VS Code (or Cursor) · optional NVIDIA GPU + Python for GPU labs

```bash
git clone https://github.com/FractiAI/tiny-footprint-multi-agent.git
cd tiny-footprint-multi-agent
code .          # or: cursor .
```

In the IDE terminal:

```bash
node scripts/tiny.mjs doctor      # hardware / deps check
node scripts/tiny.mjs install     # verify kit
node scripts/tiny.mjs demo        # multi-session sample
node scripts/tiny.mjs benchmark   # conventional vs Tiny
node scripts/tiny.mjs report      # write HTML/JSON receipts
```

`benchmark` writes results for this machine only. A lab that cannot run here reports `not_run`, and the suite's verdict reads `incomplete`.

`npm test` runs the whole Node test suite and repository gates without touching your receipts.

VS Code tasks are preconfigured under `.vscode/tasks.json` (Terminal → Run Task → `tiny: …`).

Optional real-model lab: `uv sync --group llm`, then `TINY_FOOTPRINT_FORCE_LLM_LAB=1 node scripts/tiny.mjs benchmark`. It runs on CPU, Apple MPS, NVIDIA and DirectML. The original Windows environment is pinned in `research/synthobs-tiny-gateway-rhyming-templates/requirements-directml.txt`.

---

## Multi-Agent lab (companion suite)

For the flagship shared-world vs naive per-agent copies sweep (gzip residual honesty):

```bash
git clone https://github.com/FractiAI/tiny-oracle-lob-pilot.git
cd tiny-oracle-lob-pilot
npm test
npm run multi-agent
npm run shine
```

Labeled highlights: smaller-world packs still show **~42%** residual after gzip vs naive copies; world-dominated sweeps go much higher; selective nested coarse-only tasks cut runtime working-set bytes by **~99.5%**. Always keep the after-gzip / lab-proxy qualifier.

---

## Join the industry-wide testing initiative

We invite infrastructure teams, cloud operators, accelerator partners, and AI-serving engineers to validate Tiny Footprint Multi-Agent on real hardware.

```bash
node scripts/tiny.mjs join
```

You will enter name, email, organization, role, and hardware interest.

### Share your results (opt-in)

When you **select share**, the kit packages your latest benchmark receipts (plus hostname, platform, and Node version) and **opens a message to `valetpru@gmail.com`** for the validation desk. The message holds a summary. A mail link cannot attach files, so attach the JSON packet whose path the kit prints before you send it. With SMTP configured on Windows, the kit sends it and attaches the packet itself. If you decline, `join` sends only your contact details and hardware interest.

```bash
# during join — answer "y" to share results
node scripts/tiny.mjs join

# or anytime after a benchmark
node scripts/tiny.mjs report --share
node scripts/tiny.mjs share
```

- Default: opens your system mail client with a prefilled message to **valetpru@gmail.com** (plus a local share packet under `benchmarks/reports/share-packets/`).
- Optional silent SMTP (Windows): set `TINY_FOOTPRINT_SMTP_HOST`, `TINY_FOOTPRINT_SMTP_USER`, `TINY_FOOTPRINT_SMTP_PASS`, `TINY_FOOTPRINT_SMTP_FROM`.
- Override recipient only if needed: `TINY_FOOTPRINT_SHARE_EMAIL` (default remains `valetpru@gmail.com`).

Details: [docs/product/VALIDATION.md](./docs/product/VALIDATION.md)

---

## Repository layout

```
tiny-footprint-multi-agent/          ← GitHub repo · Local kit for Tiny Footprint Multi-Agent
├── src/                  ← all logic, in submodules
│   ├── core/             ← bytes, statistics, randomness, hashing
│   ├── engine/           ← Tiny Gateway: templates, vectors, broadcast
│   ├── sdk/              ← public facade
│   ├── experiments/      ← registered suite, one module per experiment
│   ├── labs/             ← adapters that report only what ran now
│   ├── benchmarks/       ← deterministic and measured tiers
│   ├── analysis/         ← one summary; computed claim ledger
│   ├── manuscript/       ← tokens, hydration, hard-coded-value gate
│   ├── pipeline/         ← stage graph, binding to docxology/template
│   ├── verification/     ← re-derives artifacts, compares with disk
│   ├── gates/            ← repository structure rules
│   ├── cli/ share/ reporting/ workloads/ docs_tools/
│   └── tiny_footprint_labs/   ← Python: real-model lab, GPU lab, figures
├── tests/                ← mirrors src/ one to one
├── scripts/              ← thin entry points
├── benchmarks/           ← protocol (plan.json); your receipts under reports/
├── output/               ← generated receipts, figures, hydrated manuscript, PDF
├── docs/                 ← start at docs/README.md
│   ├── manuscript/       ← the study's source, rendered by docxology/template
│   └── architecture/ benchmarks/ development/ product/ reference/ research/ web/
├── research/synthobs-tiny-gateway-rhyming-templates/   ← history, receipts, old paths
├── tiny-footprint/       ← public SDK path, adapters, configuration
├── tiny-gateway/         ← engine pointer
├── workloads/            ← demo entry point
├── media/                ← product and website images
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

**H100 simulation (not live silicon):** when sessions share organization but not exact wording, a production prefix cache cannot share and the Tiny Footprint Multi-Agent template+delta residency hypothesis cuts KV about **34%** versus that prefix cache (~**1.52×** materialize bandwidth proxy on the published H100 SXM profile). When the exact prefix is identical, Tiny matches the prefix cache. The real-tensor line above shows what a measurement found.

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

## Commercial editions (preview)

- **Community** — this Local Workstation kit, free  
- **Developer Pro** — proposed $29–49/mo  
- **Server / Enterprise** — annual by GPU/server  
- **Cloud Platform** — negotiated  

Hub: https://fractisi.vercel.app/product/

**Product name lock:** customers hear **Tiny Footprint Multi-Agent**. DRAM is the engine. SQL/network are later adapters — not separate diluted SKUs.

---

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks and change rules. Report vulnerabilities privately using [SECURITY.md](./SECURITY.md).

## Support

- Contact / validation / shared results: **valetpru@gmail.com**  
- SING 13 monorepo mirror: `tiny-footprint-workstation/` in [psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

→ ∞^∞

---

## FractiSI site

Marketing site for **Tiny Footprint Multi-Agent** — product hub, research, library, open, company, recruit — lives at the repo root and deploys to https://fractisi.vercel.app (also mirrored to [FractiAI/fractisi](https://github.com/FractiAI/fractisi)).

- Product: `/product/`
- Multi-Agent paper: `/library/papers/tiny-footprint-multi-agent/`
- Recruit: `/recruit/`
