# Install FractiSI Multi-Agent (plug-and-play)

FractiSI installs **beside** your existing IDE and coding agents. You keep Cursor, Claude Code, VS Code, Git, GitHub/GitLab, and CI/CD.

## Quick path

```bash
git clone https://github.com/FractiAI/tiny-footprint-multi-agent.git
cd tiny-footprint-multi-agent
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs init
node scripts/tiny.mjs agents register worker-1 cursor
node scripts/tiny.mjs status
```

Optional coordination bench:

```bash
node scripts/tiny.mjs coord-bench
node scripts/tiny.mjs coord-bench --full
```

## Connect an existing repository

```bash
cd /path/to/your/repo
node /path/to/tiny-footprint-multi-agent/scripts/tiny.mjs init .
```

This writes:

- `.fractisi/fractisi.config.json`
- `.fractisi/state.json`

## Configuration

Copy [`fractisi.config.example.json`](../../fractisi.config.example.json) or use `fractisi/configuration/default.json`.

Tiers (`core` | `professional` | `enterprise`) are commercial capability packs of the **same** platform — not separate products.

## Docker (self-hosted)

```bash
docker compose run --rm fractisi doctor
docker compose run --rm fractisi status
```

## What stays yours

- Your IDE and agent product
- Your Git remotes and branch policies
- Your CI/CD and deploy systems

FractiSI coordinates in the background and composes contributions when safe.
