/**
 * Level III baselines — prefer real receipts on disk.
 * Measured = this host's Tiny Footprint latency/heap.
 * Historical = WISE literature fJ/MAC (EM wet-lab, other machines).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORICAL_EM_ENERGY } from '../../../src/engine/rhyming/compositional-wet-lab-scale.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const SUMMARY_PATH = join(REPO_ROOT, 'output/data/analysis_summary.json');

function readSummary() {
  if (!existsSync(SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
}

/**
 * Digital accelerator Soft Story baseline from measured materialization latency.
 * @returns {{ tier: 'measured'|'not_run', rows: object[], ratios: object, host?: object }}
 */
export function loadMeasuredDigitalLatencyBaseline() {
  const summary = readSummary();
  if (!summary?.latency?.rows?.length) {
    return { tier: 'not_run', rows: [], ratios: {}, available: false };
  }
  const rows = summary.latency.rows.map((r) => ({
    workload: r.workload,
    condition: r.condition,
    p50Ns: r.p50Ns?.estimate ?? null,
    p50Us: Number.isFinite(r.p50Ns?.estimate) ? r.p50Ns.estimate / 1e3 : null,
  }));
  const aiDup = rows.find((r) => r.workload === 'ai_context' && r.condition === 'duplicated');
  const aiTiny = rows.find((r) => r.workload === 'ai_context' && r.condition === 'tiny');
  const rhymeDup = rows.find((r) => r.workload === 'rhyme_differing' && r.condition === 'duplicated');
  const rhymeTiny = rows.find((r) => r.workload === 'rhyme_differing' && r.condition === 'tiny');
  const ratio = (a, b) =>
    Number.isFinite(a?.p50Ns) && Number.isFinite(b?.p50Ns) && b.p50Ns > 0 ? a.p50Ns / b.p50Ns : null;
  return {
    tier: 'measured',
    available: true,
    host: summary.latency.host || null,
    path: 'output/data/analysis_summary.json',
    rows,
    ratios: {
      aiContextTinyVsDuplicated: ratio(aiTiny, aiDup),
      rhymeDifferingTinyVsDuplicated: ratio(rhymeTiny, rhymeDup),
    },
    anchors: {
      aiContextDuplicatedP50Us: aiDup?.p50Us ?? null,
      aiContextTinyP50Us: aiTiny?.p50Us ?? null,
      rhymeDifferingDuplicatedP50Us: rhymeDup?.p50Us ?? null,
      rhymeDifferingTinyP50Us: rhymeTiny?.p50Us ?? null,
    },
  };
}

/**
 * Measured heap reduction anchors (digital shared-world Soft Story baseline).
 */
export function loadMeasuredHeapBaseline() {
  const summary = readSummary();
  const rows = summary?.heap?.rows;
  if (!rows?.length) return { tier: 'not_run', available: false, rows: [] };
  const at1024 = rows.filter((r) => r.sessions === 1024);
  const pick = (workload, condition) =>
    at1024.find((r) => r.workload === workload && r.condition === condition) || null;
  const identicalAliased = pick('rhyme_identical', 'aliased') || pick('rhyme_identical', 'tiny');
  const differingTiny = pick('rhyme_differing', 'tiny');
  return {
    tier: 'measured',
    available: true,
    path: 'output/data/analysis_summary.json',
    sessions: 1024,
    anchors: {
      identicalAliasedHeapReduction: identicalAliased?.heapReduction?.estimate ?? null,
      differingTinyHeapReduction: differingTiny?.heapReduction?.estimate ?? null,
    },
    rows: at1024.map((r) => ({
      workload: r.workload,
      condition: r.condition,
      heapReduction: r.heapReduction?.estimate ?? null,
      heapPerSessionBytes: r.heapPerSessionBytes ?? null,
    })),
  };
}

/** Historical EM energy — literature, not measured here. */
export function loadHistoricalEmEnergy() {
  return { ...HISTORICAL_EM_ENERGY, available: true };
}

/**
 * Soft Story comparison table: digital measured latency vs historical EM fJ/MAC.
 * Different physical quantities — reported side-by-side with explicit tiers, not equated.
 */
export function level3BaselineComparison() {
  const digital = loadMeasuredDigitalLatencyBaseline();
  const heap = loadMeasuredHeapBaseline();
  const em = loadHistoricalEmEnergy();
  return {
    digitalLatency: digital,
    digitalHeap: heap,
    historicalEmEnergy: em,
    level3Proven: false,
    honesty:
      'Digital latency/heap are measured on this host. EM fJ/MAC is historical wet-lab literature. Side-by-side Soft Story anchors — not a claim that RF replaces GPUs.',
  };
}
