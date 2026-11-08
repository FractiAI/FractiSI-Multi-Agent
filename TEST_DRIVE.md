# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.) and symposium audiences**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file.

## What this Test Drive is

**Self-paced symposium path** — fully self-sufficient in the browser; a presenter can speak from the same pages.

**Hero:** *The Multi-Agent World Inference Rhyme?* · Applied Active Inference Symposium (Nov 12–13, 2026)

### Arc (11 beats · about twenty minutes · plain English)

Voice: spare, confident, product-keynote. The objective is to **demonstrate**, not to ask the audience to decide.

1. **The case** (`#welcome`) — hero title, then the question: *when many agents share one world, does the way they organize it rhyme?*  
2. **Awareness story** (`#story`) — restroom valet · AI music · the room changes when listeners become aware (`src/testdrive/opening-story.mjs`)  
3. **Sandbox** (`#sandbox`) — Syntheverse Sandbox on Base Mainnet · enter and leave with chosen awareness · no wallet  
4. **What goes wrong** (`#problem`) — copies · context tax · different words · buried answers · collisions  
5. **Two words** (`#rhyme`) — Net Zero (*balanced zero, not nothing zero*) defined first, then the four-pillar rhyme gate  
6. **Test 1** (`#1`) — one world, not twelve · Tiny Footprint bytes  
7. **Test 2** (`#7`) — same memory, more agents · density headroom  
8. **Test 3** (`#3`) — same job, different words · exact-text cache vs Rhyming Templates  
9. **Test 4** (`#4`) — the answer was always there · 100 vs 0 discoveries  
10. **How it fits** (`#how-stack`) — stack tree + named ladder · `/media/fractisi-multi-agent-stack-tree.jpg`  
11. **Go further** (`#invite`) — recap of what the visitor ran · explore · connect · beta

Each test shows *the test* and *what to watch* before it runs, then a results card: headline number, before/after bars, a plain-language summary, and the raw log on request. Results persist locally so the last beat can recap them.

**Honesty:** coordination (Coordination · Shared state · Composition) was measured and is **not** a headline demo. At 25 agents it logged more conflicts than plain branching (3.7 vs 1.7) while finishing slightly more useful work. The stack beat says so. Do not claim fewer collisions.

**Sandbox:** Base Mainnet → Syntheverse Sandbox (`src/testdrive/sandbox-frame.mjs`). No wallet for the peek.

**Rhyme:** possible strong kinship with Active Inference (**not** framework identity). Product gate = four pillars from Net Zero (`src/testdrive/rhyme-definition.mjs`).

**Browser:** https://fractisi.vercel.app/test-drive/  
**Deck (same arc):** https://fractisi.vercel.app/talks/aai-symposium-2026/  
**IDE:**

```bash
git clone https://github.com/FractiAI/FractiSI-Multi-Agent
cd FractiSI-Multi-Agent
node scripts/tiny.mjs testdrive 1   # one world, not twelve
node scripts/tiny.mjs testdrive 7   # same memory, more agents
node scripts/tiny.mjs testdrive 3   # same job, different words
node scripts/tiny.mjs testdrive 4   # the answer was always there
# optional further labs: 2 5 6
```

Or ask your IDE agent: *Do the FractiSI Multi-Agent test drive.*

## Human one-liner

> Open https://fractisi.vercel.app/test-drive/ and press **Let’s begin** — or clone the kit and run the demos above.

## Contact · beta

- Connect / critique / joint experiments: **valetpru@gmail.com**  
- Beta: mail subject **FractiSI beta testing**  
- Deploy remains paid (Team+)

→ ∞^∞
