# Simple breakdown

We deliver software installed **alongside** existing AI. Customers do not buy new computers, replace GPUs, or move operations to FractiAI.

1. **Local** — developer PC · Workstation Kit · Free / Pro  
2. **Enterprise** — company GPU servers · Server Edition · annual license  
3. **Cloud** — provider fleets · Platform Edition · negotiated agreement  

**Without:** each session may retain full shared context independently.  
**With:** one shared representation + compact per-session state.

We install the Tiny Footprint package (runtime, SDK, benchmarks). We integrate with the customer’s inference stack through defined adapters—we do not require replacing that stack.

Sharing system/static context is the first integration. Transparent KV-cache changes need engine-specific engineering.

Full narrative on the web: https://www.ssvibelandiaquestfest24x365.com/tiny-footprint/simple
