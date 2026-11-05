/**
 * Session scaling, measured on the real workload and compared with the closed form.
 *
 * With shared bytes S, per-session bytes D and n sessions, storing S once gives
 * R(n) = f (1 - 1/n) where f = S / (S + D) is the shared fraction. The reduction is
 * capped by f however many sessions there are; the measured curves test that bound.
 */
import { bytesOf, reduction } from '../../core/bytes.mjs';
import { buildAiContextWorkload } from '../../experiments/f-ai-context.mjs';

/**
 * @param {number} n sessions
 * @param {number} f shared fraction
 */
export function predictedReduction(n, f) {
  return f * (1 - 1 / n);
}

export function sessionScaling({ seed, sessions, turns }) {
  const series = turns.map((turnCount) => {
    const points = sessions.map((n) => {
      const { conventional, tiny } = buildAiContextWorkload(seed, n, turnCount);
      const measured = reduction(bytesOf(conventional), bytesOf(tiny));
      const shared = bytesOf(tiny.systemTemplate.pattern);
      const perSession = (measured.baselineBytes - shared * n) / n;
      const sharedFraction = shared / (shared + perSession);
      return {
        sessions: n,
        baselineBytes: measured.baselineBytes,
        tinyBytes: measured.tinyBytes,
        measured: measured.ratio,
        sharedFraction,
        predicted: predictedReduction(n, sharedFraction),
      };
    });
    const largest = points[points.length - 1];
    return {
      turns: turnCount,
      sharedFractionAtLargestN: largest.sharedFraction,
      measuredAtLargestN: largest.measured,
      maxAbsoluteError: Math.max(...points.map((p) => Math.abs(p.measured - p.predicted))),
      points,
    };
  });
  return { formula: 'R(n) = f (1 - 1/n), f = S / (S + D)', series };
}
