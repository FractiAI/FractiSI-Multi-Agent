/**
 * Computational-lab baselines for Neural X-Ray Soft Story.
 * Prefer measured receipts on disk; mark tier explicitly.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const SUMMARY_PATH = join(REPO_ROOT, 'output/data/analysis_summary.json');

function readSummary() {
  if (!existsSync(SUMMARY_PATH)) return null;
  return JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
}

/** Structural match vs exact identity — measured heap / latency anchors. */
export function loadComputationalLabAnchors() {
  const summary = readSummary();
  if (!summary?.latency?.rows?.length || !summary?.heap?.rows?.length) {
    return { tier: 'not_run', available: false };
  }
  const lat = summary.latency.rows;
  const heap = summary.heap.rows.filter((r) => r.sessions === 1024);
  const pickLat = (workload, condition) =>
    lat.find((r) => r.workload === workload && r.condition === condition);
  const pickHeap = (workload, condition) =>
    heap.find((r) => r.workload === workload && r.condition === condition);
  const aiDup = pickLat('ai_context', 'duplicated');
  const aiTiny = pickLat('ai_context', 'tiny');
  const rhymeDup = pickLat('rhyme_differing', 'duplicated');
  const rhymeTiny = pickLat('rhyme_differing', 'tiny');
  const identicalAliased = pickHeap('rhyme_identical', 'aliased') || pickHeap('rhyme_identical', 'tiny');
  const differingTiny = pickHeap('rhyme_differing', 'tiny');
  const ratio = (a, b) =>
    Number.isFinite(a?.p50Ns?.estimate) && Number.isFinite(b?.p50Ns?.estimate) && b.p50Ns.estimate > 0
      ? a.p50Ns.estimate / b.p50Ns.estimate
      : null;
  return {
    tier: 'measured',
    available: true,
    path: 'output/data/analysis_summary.json',
    representationVsOrganization: {
      claim: 'exact lexical identity ≠ structural match',
      aiContextTinyVsDuplicated: ratio(aiTiny, aiDup),
      rhymeDifferingTinyVsDuplicated: ratio(rhymeTiny, rhymeDup),
      identicalAliasedHeapReduction: identicalAliased?.heapReduction?.estimate ?? null,
      differingTinyHeapReduction: differingTiny?.heapReduction?.estimate ?? null,
    },
    selectiveReconstruction: {
      aiContextTinyP50Us: aiTiny ? aiTiny.p50Ns.estimate / 1e3 : null,
      rhymeDifferingTinyP50Us: rhymeTiny ? rhymeTiny.p50Ns.estimate / 1e3 : null,
    },
  };
}
