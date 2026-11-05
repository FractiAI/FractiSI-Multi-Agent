/** Run the multi-session reference workload and print its byte comparison. */
import { demoPassed, demoSummaryLines, runMultiSessionDemo } from '../../workloads/multi-session.mjs';

export function demo(ctx) {
  ctx.log('demo · multi-session Tiny Footprint workload');
  const result = runMultiSessionDemo();
  console.log(JSON.stringify(result, null, 2));
  for (const line of demoSummaryLines(result)) console.log(line);
  return demoPassed(result) ? 0 : 1;
}
