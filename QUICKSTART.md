# Quickstart — FractiSI Multi-Agent

**Required:** Git + cloud token (`VERCEL_TOKEN` or `FRACTISI_CLOUD_TOKEN`).

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
export VERCEL_TOKEN=…
node scripts/tiny.mjs try
```

That runs worktrees → compose → git commit → cloud deploy and prints a live URL.

Tiny Footprint remains the core execution technology inside FractiSI Multi-Agent.

---

# Quick start · Tiny Footprint Workstation

You need Node 18 or newer. Python and a GPU are optional: a lab that needs them reports `not_run` without them.

1. Clone **https://github.com/FractiAI/FractiSI-Multi-Agent**
2. Open the folder in VS Code / Cursor
3. Run these in order, because `report` reads what `benchmark` wrote:

```bash
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

4. Join industry testing (contact email; optional results share → **valetpru@gmail.com**):

```bash
node scripts/tiny.mjs join
```

5. Open `benchmarks/reports/customer-benchmark.html`

Read [README.md](./README.md) for product context and honesty rails, and [docs/README.md](./docs/README.md) for everything else.

A lab that cannot run on your machine reports `not_run`. That is expected on a machine with no GPU, and the verdict reads `incomplete`.
