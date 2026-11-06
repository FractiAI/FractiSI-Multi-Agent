/** Run comparative coordination benchmark (A/B/C). */
import fs from 'node:fs';
import path from 'node:path';
import { runComparativeBench } from '../../platform/comparative-bench.mjs';

export function coordBench(ctx) {
  const full = ctx.flag('--full');
  const agentCounts = full ? [5, 10, 25, 50] : [5, 10, 25];
  ctx.log(`coord-bench · agents=${agentCounts.join(',')} · measured in-process simulation`);
  const report = runComparativeBench({ agentCounts, runs: full ? 5 : 3 });
  const outDir = path.join(ctx.reports, 'platform');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'comparative-bench.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  for (const n of agentCounts) {
    const rows = report.results.filter((r) => r.agents === n);
    const avg = (arm, key) => rows.reduce((s, r) => s + r.arms[arm][key], 0) / rows.length;
    ctx.log(
      `n=${n} · A conflicts=${avg('A', 'mergeConflicts').toFixed(1)} useful=${avg('A', 'usefulCompletedTasks').toFixed(1)} · ` +
        `C conflicts=${avg('C', 'mergeConflicts').toFixed(1)} useful=${avg('C', 'usefulCompletedTasks').toFixed(1)} compositions=${avg('C', 'successfulCompositions').toFixed(1)}`,
    );
  }
  ctx.log(`wrote ${outPath}`);
  return 0;
}
