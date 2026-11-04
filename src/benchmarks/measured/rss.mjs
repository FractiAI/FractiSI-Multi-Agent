/** Design of the RSS benchmark. The parent writes the wire text once, to a temporary file. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runDesign } from './child-runner.mjs';
import { getWorkload } from './session-stores.mjs';

/**
 * @param {object} rssPlan plan.measured.rss
 * @param {object} seeds plan.seeds
 * @param {{onProgress?: Function}} [options]
 */
export function runRssBenchmark(rssPlan, seeds, { onProgress } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-footprint-rss-'));
  try {
    const wiresPath = path.join(dir, 'wires.jsonl');
    const wires = getWorkload(rssPlan.workload).wires({ sessions: rssPlan.sessions, seed: seeds.primary, turns: rssPlan.turns });
    fs.writeFileSync(wiresPath, wires.join('\n'));
    const specs = rssPlan.conditions.flatMap((condition) =>
      Array.from({ length: rssPlan.trials }, (_, trial) => ({
        kind: 'rss',
        workload: rssPlan.workload,
        condition,
        sessions: rssPlan.sessions,
        turns: rssPlan.turns,
        trial,
        wiresPath,
      })),
    );
    return runDesign(specs, seeds.orderShuffle + 2, onProgress);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
