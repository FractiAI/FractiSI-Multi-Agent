# Tiny Footprint Workstation

### Less Memory. Lower Latency. More AI Performance.

**FractiAI commercial product kit** · powered by **Tiny Gateway™**

[![Edition](https://img.shields.io/badge/edition-Community%20FREE-c9a227)](./docs/product/PRODUCT.md)
[![Product hub](https://img.shields.io/badge/hub-ssvibelandia-0b1424)](https://www.ssvibelandiaquestfest24x365.com/tiny-footprint)

---

## What is Tiny Footprint?

Tiny Footprint is software you install **beside** your existing AI stack. It does **not** replace your GPUs, your inference server, or your applications. It helps that AI use **memory more efficiently** and potentially **respond faster** by matching a **holographic rhyme**: repeating · self-similar · self-correcting · recursive organization, stored once, with nested differences kept per session — including when the words differ. An exact-text cache only helps when the words themselves repeat; a shared identical system prompt is useful prefix reuse, not the full rhyme definition.

| | Without Tiny Footprint | With Tiny Footprint |
|--|------------------------|---------------------|
| Sessions | Each may retain full shared context | Shared representation once |
| State | Shared info reprinted per session | Compact session deltas |
| Goal | — | Less resident memory · lower preparation latency |

**One Tiny Gateway engine · three commercial editions**

| Edition | Who | Where it runs |
|---------|-----|----------------|
| **Local (this repo)** | Developers & researchers | Your IDE / workstation |
| **Server** | Enterprises | Company GPU servers |
| **Cloud** | Hyperscale / GPU clouds | Provider infrastructure |

Product story: [product](./docs/product/PRODUCT.md) · [plain language](./docs/product/SIMPLE.md) · [technology](./docs/research/TECH.md) · [whitepaper](./docs/research/TECH_PAPER.md)

Evidence: [results and claim ledger](./docs/benchmarks/RESULTS.md) · [reproducible study (PDF)](./output/pdf/tiny-footprint-workstation_combined.pdf) · [all documentation](./docs/README.md)

### Brochures & plainspeak (in this repo)

Open in a browser from `docs/web/`:

| Doc | Path |
|-----|------|
| **Plainspeak** | [docs/web/simple.html](./docs/web/simple.html) |
| **Tech brochure** | [docs/web/tech-brochure.html](./docs/web/tech-brochure.html) |
| **Print / PDF brochure** | [docs/web/commercial-brochure-print.html](./docs/web/commercial-brochure-print.html) |
| **Product hub snapshot** | [docs/web/product-hub.html](./docs/web/product-hub.html) |

Live site: https://www.ssvibelandiaquestfest24x365.com/tiny-footprint · plainspeak: `/tiny-footprint/simple`

---

## IDE install (5 commands)

**Requirements:** Git · Node.js 18+ · VS Code (or Cursor) · optional NVIDIA GPU + Python for GPU labs

```bash
git clone https://github.com/FractiAI/tiny-footprint-workstation.git
cd tiny-footprint-workstation
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

## Join the industry-wide testing initiative

We invite infrastructure teams, cloud operators, accelerator partners, and AI-serving engineers to validate Tiny Footprint on real hardware.

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
tiny-footprint-workstation/
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

<!-- BEGIN GENERATED EVIDENCE -->
**In short:** sharing a prompt prefix across sessions is the one thing here that performs, and production prefix caches already do it. The rhyming engine does not beat a plain object reference in memory, and it is slower to rebuild a session. [The results page](./docs/benchmarks/RESULTS.md) has the short answer with its numbers.

Generated from the receipts in [`output/data/`](./output/data/README.md). Measured values are from **Apple M4 Pro**. [Full results and the claim ledger](./docs/benchmarks/RESULTS.md).

- **Representation bytes** (deterministic): the published aggregate reproduces at **84.5%**. It is 74.3% with equal weights and 77.0% over lossless workloads, against a target of 80%.
- **Live memory** (measured, 1,024 sessions sharing a system prompt): JSON predicts 49.5% and the V8 heap falls **32.8%**. A plain object reference reaches 32.9%.
- **Same shape, different words** (measured): JSON predicts 35.9% and the shipped engine's heap shows **4.2%**. A tighter encoding of the same idea reaches 20.9%, level with a plain reference at 20.1%.
- **In-process latency** (measured): materializing a session takes 1.69× to 11.81× the time of reading a duplicated store.
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

## Commercial editions (preview)

- **Community** — this kit, free  
- **Developer Pro** — proposed $29–49/mo  
- **Server / Enterprise** — annual by GPU/server  
- **Cloud Platform** — negotiated  

Hub pricing: https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/local

---

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks and change rules. Report vulnerabilities privately using [SECURITY.md](./SECURITY.md).

## Support

- Contact / validation / shared results: **valetpru@gmail.com**  
- SING 13 monorepo mirror: `products/tiny-footprint-workstation/` in [psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

→ ∞^∞

---

## FractiSI site

Marketing site for FractiSI (product hub, research, library, company, recruit) lives at the repo root and deploys to https://fractisi.vercel.app.

- Recruit: `/recruit/`
