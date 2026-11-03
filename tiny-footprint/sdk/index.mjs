/**
 * Tiny Footprint SDK · Workstation 0.1
 * Thin façade for template submit / session delta / measure.
 */
export const PRODUCT = 'Tiny Footprint';
export const VERSION = '0.1.0';

/**
 * @param {string} templateId
 * @param {unknown} pattern
 */
export function registerTemplate(templateId, pattern) {
  return { templateId, pattern, registeredAt: new Date().toISOString() };
}

/**
 * @param {string} templateId
 * @param {unknown} delta
 */
export function sessionDelta(templateId, delta) {
  return { templateId, delta, kind: 'session_delta' };
}

/**
 * Selective reconstruction stub — returns working set descriptor.
 */
export function reconstruct(templateId, delta, opts = {}) {
  return {
    templateId,
    workingSet: { patternRef: templateId, delta, selective: true, ...opts },
  };
}

export function measureBytes(obj) {
  return JSON.stringify(obj).length;
}
