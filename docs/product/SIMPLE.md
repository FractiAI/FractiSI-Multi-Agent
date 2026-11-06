# Simple breakdown

> **Evidence note.** Byte counts on this page are serialized JSON, not memory. For live memory, latency and real-model results, see the [results and claim ledger](../benchmarks/RESULTS.md).

We deliver software installed **alongside** existing AI. Customers do not buy new computers, replace GPUs, or move operations to FractiAI.

1. **Local** — developer PC · Workstation Kit · Free / Pro  
2. **Enterprise** — company GPU servers · Server Edition · annual license  
3. **Cloud** — provider fleets · Platform Edition · negotiated agreement  

**Without:** each session may retain full shared context independently.  
**With:** the memory bank is used more like a wider cache—exact repeats share as today, and organizational near-duplicates can share when the words differ.

A **rhyme** matches the organization of a session — repeating, self-similar, self-correcting, and recursive — rooted at **Net Zero (octave 0)** and nested through ascending octaves, not merely the exact words or a mid-level schema match. Exact prefix reuse is still the largest measured win (and production prefix caches already cover it). Rhyme is the expanded-cache slice: same shape, different wording, from Net Zero up the octave ladder. On the open benchmark study, rhyme does not beat a plain object reference on live heap; JSON-byte savings are not the same as RAM. Rebuild paths that only serialize should not pay for a deep clone on every materialize.

We install the Tiny Footprint package (runtime, SDK, benchmarks). We integrate with the customer’s inference stack through versioned adapters—Workstation 0.2 ships the in-process demo adapter; serving integrations are planned. We do not require replacing that stack.

Full narrative on the web: https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/simple


## Try it

Git + `VERCEL_TOKEN` (or `FRACTISI_CLOUD_TOKEN`):

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent.git
cd FractiSI-Multi-Agent
export VERCEL_TOKEN=…
node scripts/tiny.mjs try
```

Flagship product: **FractiSI Multi-Agent**. Core tech: **Tiny Footprint**.
