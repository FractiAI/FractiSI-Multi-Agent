/**
 * FractiSI product rhyme discovery for ζ-23 invent.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_RHYME_PINS,
  loadProductRhymeCatalog,
  inventObjectFeatures,
  buildAwarePartnerBoard,
  discoverInventRhymes,
  formatRhymeDiscoveryForPrompt,
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
    assert.ok(String(cat.generatedAt || '').startsWith('2026-11'));
    assert.equal(cat.proteinFolding[0].rhyme, 'protein-folding');
    assert.match(cat.llm[0].kind, /partner|coupling|lag/i);
  });

  it('builds an AWARE partner board (#53) that ranks by coupling', () => {
    const query = {
      id: 'focus:two_thirds_on_critical_line',
      name: 'two_thirds_on_critical_line',
      features: inventObjectFeatures({
        name: 'two_thirds_on_critical_line',
        stmt: '∀ ε > 0, ∃ T0, ∀ T ≥ T0, N0star T ≥ (2/3 - ε) * Ncount T',
      }),
    };
    const pool = [
      {
        id: 'inventmath:rank_trace_inequality_real_diag',
        name: 'rank_trace_inequality_real_diag',
        source: 'InventMath',
        closed: true,
        features: inventObjectFeatures({
          name: 'rank_trace_inequality_real_diag',
          stmt: 'rank_trace inequality',
          closed: true,
          source: 'InventMath',
        }),
      },
      {
        id: 'peer:five_sixths_distinct',
        name: 'five_sixths_distinct',
        source: 'peer_invent',
        closed: false,
        features: inventObjectFeatures({
          name: 'five_sixths_distinct',
          stmt: 'Ndist ≥ (5/6) * Ncount',
        }),
      },
    ];
    const board = buildAwarePartnerBoard(query, pool, { topK: 2 });
    assert.equal(board.length, 2);
    assert.ok(board[0].score >= board[1].score);
    assert.ok(typeof board[0].score === 'number');
  });

  it('discovers invent rhymes from product catalog + InventMath pool', () => {
    const d = discoverInventRhymes({
      theorem: 'two_thirds_on_critical_line',
      stmt: '∀ ε > 0, ∃ T0, ∀ T ≥ T0, ↑(N0star (0) T) ≥ (2 / 3 - ε) * ↑(Ncount (0) T)',
      binders: '(ε : ℝ) (hε : 0 < ε)',
      proofs: new Map([
        ['five_sixths_distinct', { closed: false, body: 'sorry', tacticId: 'sorry_hold' }],
      ]),
      attempts: [],
      limit: 6,
    });
    assert.equal(d.ok, true);
    assert.match(d.discoveryKind, /#53|#52|#54|RHYME_DISCOVERY_CATALOG/);
    assert.equal(d.productCatalog.ok, true);
    assert.ok(d.productCatalog.n >= 100);
    assert.ok(d.poolSize >= 1);
    assert.ok(Array.isArray(d.awareBoard));
    assert.ok(d.exemplars.length >= 1);
    assert.ok(d.exemplars.some((e) => e.shelf === 53 || e.shelf === 54));

    const block = formatRhymeDiscoveryForPrompt(d);
    assert.match(block, /RELATIONAL AWARENESS BOARD/);
    assert.match(block, /RHYME_DISCOVERY_CATALOG/);
    assert.match(block, /#53/);
    assert.doesNotMatch(block, /sealed Anthropic Zeta23/i);
  });
});
