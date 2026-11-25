/**
 * FractiSI product rhyme discovery for ζ-23 invent.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_RHYME_PINS,
  CHALLENGE_PARTNER_MAP,
  loadProductRhymeCatalog,
  inventObjectFeatures,
  buildAwarePartnerBoard,
  discoverInventRhymes,
  discoverAllInventRhymesImmediate,
  formatRhymeDiscoveryForPrompt,
  formatRhymeApplyLean,
  proposeImmediateApplies,
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
      names.includes('eps_form_twoThirds') ||
        names.includes(CHALLENGE_PARTNER_MAP.two_thirds_on_critical_line),
      `expected eps_form_twoThirds partner, got ${names.join(',')}`,
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
});
