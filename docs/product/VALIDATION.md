# Industry-wide validation initiative

FractiAI invites AI infrastructure organizations, cloud operators, accelerator teams, and serving engineers to validate Tiny Footprint on real hardware—with **memory and latency** as co-equal objectives.

## Join from this IDE kit

```bash
node scripts/tiny.mjs join
```

You will be asked for name, email, organization, role, and hardware interest. Submitting `join` opens an email with those contact details.

**Share results (optional):** when you answer **yes**, the kit builds a share packet from your latest benchmarks on this machine (including hostname, platform, Node version, and receipt contents) and **sends it to `valetpru@gmail.com`** (opens your mail client with a prefilled summary, and you attach the packet whose path it prints; or silent SMTP on Windows, which attaches it, if you set the `TINY_FOOTPRINT_SMTP_*` env vars). If you answer **no**, only your contact details and hardware interest are sent; no benchmark receipts are read or attached.

You can also share later:

```bash
node scripts/tiny.mjs report --share
node scripts/tiny.mjs share
```

## What FractiAI contributes

Tiny Gateway · Workstation · local GPU methodology · benchmark harness  

## What partners contribute

Accelerator access · representative workloads · serving expertise · feedback  
Proprietary weights can stay inside your environment.

## Web signup

https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/validation
