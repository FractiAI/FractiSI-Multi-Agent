/**
 * Representation-size accounting.
 *
 * UTF-8 JSON byte counts are a portable proxy for how large a value is when
 * serialized. They are not resident memory: `src/benchmarks/measured/` exists
 * because the two can disagree.
 */

/** Stable JSON byte size (UTF-8) as portable resident-representation proxy. */
export function bytesOf(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

/**
 * @param {number} baselineBytes
 * @param {number} tinyBytes
 */
export function reduction(baselineBytes, tinyBytes) {
  if (baselineBytes <= 0) return { ratio: 0, saved: 0 };
  const saved = baselineBytes - tinyBytes;
  return { ratio: saved / baselineBytes, saved, baselineBytes, tinyBytes };
}

/**
 * Byte-weighted aggregate reduction: totals are summed before the ratio is
 * taken, so a workload's influence is proportional to its baseline size.
 *
 * @param {ReadonlyArray<{baselineBytes: number, tinyBytes: number}>} parts
 */
export function aggregateReduction(parts) {
  let baseline = 0;
  let tiny = 0;
  for (const p of parts) {
    baseline += p.baselineBytes;
    tiny += p.tinyBytes;
  }
  return reduction(baseline, tiny);
}
