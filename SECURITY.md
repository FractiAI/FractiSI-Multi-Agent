# Security policy

## Supported versions

Workstation 0.1.x is the current Community kit.

## Reporting a vulnerability

Email `valetpru@gmail.com` with the subject `Tiny Footprint security`. Do not open a public issue for a suspected secret leak, private data exposure, or an exploitable bug. Include the affected command or file, reproduction steps, and the impact you observed.

We aim to acknowledge reports within three business days and will coordinate disclosure after a fix is available.

## Scope

In scope: the CLI (`scripts/tiny.mjs`), the opt-in share path (`scripts/share-results.mjs`), local report generation, and the SDK under `tiny-footprint/`.

Out of scope: vulnerabilities in third-party GPU drivers, Python packages installed for the optional research labs, and results that require running untrusted code on your own machine. Review the research scripts before running them with a GPU environment.

## Data handling

`share` is opt-in. The share packet contains local benchmark receipts plus hostname, platform, and Node version. If a participant declines sharing during `join`, only contact details and hardware interest are sent. Share packets are written under `benchmarks/reports/share-packets/`, which is gitignored.
