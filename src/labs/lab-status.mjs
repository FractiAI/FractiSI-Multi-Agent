/**
 * Outcome vocabulary for optional labs.
 *
 * `not_run` is a first-class outcome, distinct from pass and from fail. A lab
 * that could not execute on this host has produced no evidence either way.
 */
export const LAB_STATUS = Object.freeze({ PASS: 'pass', FAIL: 'fail', NOT_RUN: 'not_run' });

/**
 * @param {string} reason stable machine-readable reason
 * @param {string} [detail] human-readable detail
 */
export function notRunReport(reason, detail) {
  return { ok: false, status: LAB_STATUS.NOT_RUN, liveRun: false, reason, ...(detail ? { detail } : {}) };
}
