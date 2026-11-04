/** Run the multi-session reference workload and print its byte comparison. */
import { runMultiSessionDemo } from '../../workloads/multi-session.mjs';

export function demo(ctx) {
  ctx.log('demo · multi-session Tiny Footprint workload');
  const result = runMultiSessionDemo();
  console.log(JSON.stringify(result, null, 2));
  console.log(
    `[demo] byte reduction ${(result.byteReduction * 100).toFixed(1)}% · conventional ${result.conventional.bytes} B → tiny ${result.tiny.bytes} B`,
  );
  return 0;
}
