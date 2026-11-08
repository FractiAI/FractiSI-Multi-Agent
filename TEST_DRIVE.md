# FractiSI Multi-Agent · Test Drive

**For IDE agents (Cursor, Claude Code, VS Code Copilot, etc.) and symposium audiences**

If a human opens this repository and asks you to **do the FractiSI Multi-Agent test drive**, follow this file.

## What this Test Drive is

**Self-paced symposium path** — fully self-sufficient in the browser; a presenter can speak from the same pages.

**Hero:** *One shared world. Four live tests.* · Applied Active Inference Symposium (Nov 12–13, 2026) · about twenty minutes · no account · no wallet · live numbers. The session title, *The Multi-Agent World Inference Rhyme?*, appears on the first step.

### Arc (12 steps · about twenty minutes)

Voice: frontier-lab product page. Precise, calm, specific. Short declarative sentences, numbers over adjectives, no hype, no emoji, no exclamation marks. The objective is to **demonstrate**, not to ask the audience to decide.

1. **The question** (`#welcome`) — *The question under test.* Then: *when many agents share one world, does the way they organize it rhyme?*  
2. **Awareness story** (`#story`) — *Same sound. Different room.* Restroom valet · AI music · the room changes when listeners learn the source (`src/testdrive/opening-story.mjs`)  
3. **Sandbox** (`#sandbox`) — *Where this runs.* Syntheverse Sandbox on Base Mainnet · enter and leave with chosen awareness · no wallet  
4. **Five costs of a crowd** (`#problem`) — copies · context tax · different words · buried answers · collisions  
5. **Two definitions** (`#rhyme`) — Net Zero (*balanced zero, not nothing zero*) first, then the four-pillar rhyme gate  
6. **Test 1** (`#1`) — one world, not twelve · Tiny Footprint bytes  
7. **Test 2** (`#7`) — same memory, more agents · density headroom  
8. **Test 3** (`#3`) — same job, different words · exact-text cache vs Rhyming Templates  
9. **Test 4** (`#4`) — answers six links deep · 100 vs 0 discoveries  
10. **How the stack fits together** (`#how-stack`) — stack tree + named ladder · `/media/fractisi-multi-agent-stack-tree.jpg`  
11. **Rehearse the future. Change the world on approval.** (`#futures`) — Predictive Shared State: rehearse futures before touching the real world · predictions cannot overwrite the real world without approval · imagination-chosen ordering: about +1.4 useful tasks at 32 agents, about +3.6 at 100, never more than 5% behind · about 99% smaller shared world at 100 agents · not a claim that we wrapped Cosmos or V-JEPA into the core  
12. **The demonstration is complete.** (`#invite`) — recap · explore · World Model research · connect · beta

Each test shows *The test* and *What to watch* before it runs, then a result card: headline number, before/after bars, a plain-language summary, and the raw log on request. Results persist locally (storage keys `…-v13`) so the last step can recap them.

**Honesty:** coordination (Coordination · Shared state · Composition) was measured and is **not** a headline demo. At 25 agents it logged more conflicts than plain branching (3.7 vs 1.7) while finishing slightly more useful work. The stack step says so. Do not claim fewer collisions.

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
node scripts/tiny.mjs testdrive 4   # answers six links deep
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
