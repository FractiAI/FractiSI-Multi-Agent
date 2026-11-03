# Tiny Footprint Workstation

### Less Memory. Lower Latency. More AI Performance.

**FractiAI commercial product kit** · powered by **Tiny Gateway™**

[![License](https://img.shields.io/badge/edition-Community%20FREE-c9a227)](./docs/PRODUCT.md)
[![Product hub](https://img.shields.io/badge/hub-ssvibelandia-0b1424)](https://www.ssvibelandiaquestfest24x365.com/tiny-footprint)

---

## What is Tiny Footprint?

Tiny Footprint is software you install **beside** your existing AI stack. It does **not** replace your GPUs, your inference server, or your applications. It helps that AI use **memory more efficiently** and potentially **respond faster** by sharing reusable organizational patterns once and keeping compact per-session differences.

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

Product story: [docs/PRODUCT.md](./docs/PRODUCT.md) · [docs/SIMPLE.md](./docs/SIMPLE.md) · [docs/TECH.md](./docs/TECH.md)

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

VS Code tasks are preconfigured under `.vscode/tasks.json` (Terminal → Run Task → `tiny: …`).

Optional GPU LLM lab (Windows DirectML): see `research/synthobs-tiny-gateway-rhyming-templates/requirements-directml.txt`.

---

## Join the industry-wide testing initiative

We invite infrastructure teams, cloud operators, accelerator partners, and AI-serving engineers to validate Tiny Footprint on real hardware.

```bash
node scripts/tiny.mjs join
```

You will enter name, email, organization, and hardware interest.

### Share your results (opt-in)

When you **select share**, the kit packages your latest benchmark receipts and **emails them to `valetpru@gmail.com`** for the validation desk.

```bash
# during join — answer "y" to share results
node scripts/tiny.mjs join

# or anytime after a benchmark
node scripts/tiny.mjs report --share
node scripts/tiny.mjs share
```

- Default: opens your system mail client with a prefilled message to **valetpru@gmail.com** (plus a local share packet under `benchmarks/reports/share-packets/`).
- Optional silent SMTP: set `TINY_FOOTPRINT_SMTP_HOST`, `TINY_FOOTPRINT_SMTP_USER`, `TINY_FOOTPRINT_SMTP_PASS`, `TINY_FOOTPRINT_SMTP_FROM`.
- Override recipient only if needed: `TINY_FOOTPRINT_SHARE_EMAIL` (default remains `valetpru@gmail.com`).

Details: [docs/VALIDATION.md](./docs/VALIDATION.md)

---

## Repository layout

```
tiny-footprint-workstation/
├── README.md                 ← you are here
├── QUICKSTART.md
├── docs/                     ← product · simple · tech · validation
│   └── web/                  ← plainspeak + tech/commercial brochures (HTML)
├── media/                    ← product images
├── scripts/tiny.mjs          ← doctor | install | demo | benchmark | report | join | share
├── tiny-gateway/             ← engine pointer
├── tiny-footprint/           ← SDK · adapters · configuration
├── workloads/                ← demo multi-session app
├── benchmarks/reports/       ← your receipts + share packets
└── research/
    └── synthobs-tiny-gateway-rhyming-templates/   ← proven benchmark suite
```

---

## Measured local evidence (honesty-bound)

On FractiAI’s developer GeForce class labs (see suite receipts):

- Allocation proxy: large device-memory cuts (e.g. ~81% alloc / ~73% peak in the published configuration)
- Real tiny-gpt2 path: prefill / generate / train-step speedups with vs without Tiny Footprint

These are **local** results. They are **not** CapEx guarantees, **not** datacenter HBM identity, and **not** hosted frontier-vendor attestations. Your `tiny benchmark` + `tiny report` produce receipts on **your** machine.

---

## Commercial editions (preview)

- **Community** — this kit, free  
- **Developer Pro** — proposed $29–49/mo  
- **Server / Enterprise** — annual by GPU/server  
- **Cloud Platform** — negotiated  

Hub pricing: https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/local

---

## Support

- Validation desk email (shared results): **valetpru@gmail.com**  
- Purser / commercial: purser@ssvibelandiaquestfest24x365.com  
- SING 13 monorepo mirror: `products/tiny-footprint-workstation/` in [psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

→ ∞^∞
