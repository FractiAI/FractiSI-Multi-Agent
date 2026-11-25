/**
 * FractiSI product rhyme discovery for ζ-23 invent.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_RHYME_PINS,
  CHALLENGE_PARTNER_MAP,
  ENDGAME_SEED_MAP,
  loadProductRhymeCatalog,
  inventObjectFeatures,
  buildAwarePartnerBoard,
  discoverInventRhymes,
  discoverAllInventRhymesImmediate,
  formatRhymeDiscoveryForPrompt,
  formatRhymeApplyLean,
  proposeImmediateApplies,
  planMeetInMiddle,
  xraySeedEdgeChallenge17,
  gpsSeedEdgeRoute,
  omniversalSeedEdgeNav,
  tunnelNestedPairs,
  tunnelFleetNestedPairs,
} from '../../src/expeditions/riemann-zeta23-rhyme-discover.mjs';

describe('riemann zeta23 product rhyme discovery', () => {
  it('pins the live FractiSI product rhymes #52 #53 #54', () => {
    const ids = PRODUCT_RHYME_PINS.map((p) => p.id).sort((a, b) => a - b);
    assert.deepEqual(ids, [52, 53, 54]);
  });

  it('loads data/RHYME_DISCOVERY_CATALOG.json with named discoveries', () => {
    const cat = loadProductRhymeCatalog();
    assert.equal(cat.ok, true);
    assert.ok(cat.n >= 100);
    assert.ok(cat.proteinFolding.length >= 1);
    assert.ok(cat.llm.length >= 1);
  });

  it('AWARE board recovers InventMath assembly partner for two_thirds (immediate)', () => {
    const d = discoverInventRhymes({
      theorem: 'two_thirds_on_critical_line',
      stmt: '∀ ε > 0, ∃ T0, ∀ T ≥ T0, (2/3 - ε) * Ncount ≤ N0star',
      binders: '',
      proofs: new Map(),
      attempts: [],
      limit: 6,
    });
    assert.equal(d.ok, true);
    assert.ok(d.awareBoard.length >= 1);
    // Mapped organizational partner must surface with usable InventMath apply.
    const names = d.awareBoard.map((p) => p.name);
    assert.ok(
      names.includes(CHALLENGE_PARTNER_MAP.two_thirds_on_critical_line) ||
        names.includes('challengeA_dyadic_of_Hfun') ||
        names.includes('eps_form_twoThirds'),
      `expected meet/eps partner, got ${names.join(',')}`,
    );
    assert.ok(d.namedDiscoveries.length >= 1);
    assert.ok(d.immediateApplies.length >= 1);
    assert.ok(d.immediateApplies.some((a) => a.tacticBody.startsWith('exact ')));
    // Structural exact must NOT claim every InventMath lemma (family keys differ).
    const falseExact = (d.structuralHits || []).filter(
      (h) => h.exact && !String(h.id).includes('thmA') && !String(h.id).includes('two_minus'),
    );
    // At least family discrimination: not all hits exact.
    const exactCount = (d.structuralHits || []).filter((h) => h.exact).length;
    assert.ok(exactCount < (d.structuralHits || []).length || d.structuralHits.length <= 1);
  });

  it('immediate batch discovers partners for all Challenge theorems in ms', () => {
    const theorems = Object.keys(CHALLENGE_PARTNER_MAP).map((name) => ({
      name,
      stmt: name.includes('five_sixths')
        ? '(5/6)*Ncount ≤ Ndist'
        : '(2/3)*Ncount ≤ N0star',
    }));
    const batch = discoverAllInventRhymesImmediate(theorems);
    assert.equal(batch.ok, true);
    assert.ok(batch.durationMs < 5000);
    assert.equal(batch.theoremCount, theorems.length);
    assert.ok(batch.namedDiscoveryCount >= theorems.length);
    assert.ok(batch.uniqueApplyPartners.length >= 1);
    const lean = formatRhymeApplyLean(batch.uniqueApplyPartners);
    assert.match(lean, /import InventMath/);
    assert.match(lean, /rhyme_apply_/);
    assert.match(lean, /exact |have _ :=/);
  });

  it('formats AWARE pack for Groq with apply proposals', () => {
    const d = discoverInventRhymes({
      theorem: 'five_sixths_distinct',
      stmt: '(5/6)*Ncount ≤ Ndist',
      proofs: new Map(),
    });
    const block = formatRhymeDiscoveryForPrompt(d);
    assert.match(block, /RELATIONAL AWARENESS BOARD/);
    assert.match(block, /immediate apply/);
    assert.match(block, /#52|#53/);
  });

  it('proposeImmediateApplies yields exact partner reconstructs', () => {
    const applies = proposeImmediateApplies({
      query: { theorem: 'two_thirds_on_critical_line' },
      awareBoard: [
        {
          id: 'inventmath:thmA_indicator_specialization',
          name: 'thmA_indicator_specialization',
          source: 'InventMath',
          coupling: 0.9,
          tacticBody: 'exact thmA_chain_two_thirds hN hR h',
        },
      ],
    });
    assert.ok(applies.length >= 1);
    assert.equal(applies[0].kind, 'exact_partner');
    assert.equal(applies[0].tacticBody, 'exact thmA_indicator_specialization');
  });

  it('planMeetInMiddle reports A/B/C glue readiness from InventMath', () => {
    const m = planMeetInMiddle();
    assert.equal(m.ok, true);
    assert.ok(m.meetReadyCount >= 6, `expected ≥6 meet-ready, got ${m.meetReadyCount}`);
  });

  it('omniversal x-ray + GPS brings all 17 seed↔edge paths into view in ms', () => {
    const theorems = Object.keys(CHALLENGE_PARTNER_MAP).map((name) => ({ name, stmt: '' }));
    assert.equal(theorems.length, 17);
    const nav = omniversalSeedEdgeNav(theorems);
    assert.equal(nav.ok, true);
    assert.ok(nav.durationMs < 500, `expected near-instant x-ray+GPS, got ${nav.durationMs}ms`);
    assert.equal(nav.xray.rays.length, 17);
    assert.equal(nav.gps.routes.length, 17);
    assert.equal(nav.destination.target, 17);
    assert.ok(nav.fleetInstruction);
    // Every edge has a seed invent_<edge> and ranked solutions between seed and edge.
    for (const ray of nav.xray.rays) {
      assert.equal(ray.seed, ENDGAME_SEED_MAP[ray.edge]);
      assert.ok(ray.solutions.length >= 2, `${ray.edge} needs octave path`);
      assert.ok(ray.bestSolution, `${ray.edge} needs best solution`);
      assert.ok(ray.nextGap || ray.edgeClosed || ray.nearInstantReady);
    }
    // GPS destination tracks 17/17; glue meet-ready visible on A/B/C family.
    assert.ok(nav.whereWeAre.meetReadyCount >= 6);
    assert.equal(nav.whereWeAre.challengeSolutionClosed, 0);
    const gps = gpsSeedEdgeRoute(nav.xray);
    assert.ok(gps.nextHops.length >= 1);
    assert.match(gps.fleetInstruction, /navigate|near-instant|destination/);
  });

  it('x-ray ranks best partner between seed and edge', () => {
    const theorems = [{ name: 'two_thirds_on_critical_line', stmt: '' }];
    const xray = xraySeedEdgeChallenge17(theorems);
    const ray = xray.rays[0];
    assert.ok(ray.bestSolution?.name);
    assert.ok(ray.rankedSolutions[0].coupling >= ray.rankedSolutions.at(-1).coupling);
  });

  it('nested-pair tunnel runs seed-inward and edge-inward meeting in the middle', () => {
    const theorems = Object.keys(CHALLENGE_PARTNER_MAP).map((name) => ({ name, stmt: '' }));
    const nav = omniversalSeedEdgeNav(theorems);
    assert.equal(nav.nestedTunnel.recursive, true);
    assert.equal(nav.nestedTunnel.bidirectional, true);
    assert.equal(nav.nestedTunnel.meetInMiddle, true);
    assert.equal(nav.highestPair.desiredEnd, '17/17');
    assert.equal(nav.nestedTunnel.tunnels.length, 17);
    const t = tunnelNestedPairs(nav.xray.rays[0]);
    assert.equal(t.highestPair.kind, 'highest_seed_edge');
    assert.equal(t.bottomUp.direction, 'seed_inward');
    assert.equal(t.topDown.direction, 'edge_inward');
    assert.ok(t.nestedPairs.length >= 1);
    assert.ok(t.meetInMiddle.glueReady || t.meetInMiddle.meetNode);
    const fleet = tunnelFleetNestedPairs(nav.xray);
    assert.match(fleet.instruction, /tunnel|meet|arrived|exact/);
  });
});
