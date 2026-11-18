/**
 * Common WORLD interface for Shared World Models expedition.
 * Capability classes: native | adapter | unavailable
 * Never silently invent unsupported ops.
 */

export const WORLD_OPS = Object.freeze([
  'observe',
  'read_state',
  'write_state',
  'predict',
  'simulate',
  'share',
  'fork',
  'merge',
  'materialize',
  'reset',
]);

export const CAPABILITY = Object.freeze({
  NATIVE: 'native',
  ADAPTER: 'adapter',
  UNAVAILABLE: 'unavailable',
});

export class UnsupportedWorldOpError extends Error {
  constructor(op, architecture) {
    super(`${architecture}: WORLD.${op} is unavailable (not silently fabricated)`);
    this.name = 'UnsupportedWorldOpError';
    this.op = op;
    this.architecture = architecture;
  }
}

/**
 * @typedef {object} WorldCapabilities
 * @property {'native'|'adapter'|'unavailable'} [observe]
 * @property {'native'|'adapter'|'unavailable'} [read_state]
 * @property {'native'|'adapter'|'unavailable'} [write_state]
 * @property {'native'|'adapter'|'unavailable'} [predict]
 * @property {'native'|'adapter'|'unavailable'} [simulate]
 * @property {'native'|'adapter'|'unavailable'} [share]
 * @property {'native'|'adapter'|'unavailable'} [fork]
 * @property {'native'|'adapter'|'unavailable'} [merge]
 * @property {'native'|'adapter'|'unavailable'} [materialize]
 * @property {'native'|'adapter'|'unavailable'} [reset]
 */

/**
 * Base WORLD adapter. Subclasses implement ops; unavailable ops throw.
 */
export class WorldAdapter {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.architecture
   * @param {WorldCapabilities} opts.capabilities
   * @param {string} [opts.category] A|B|C|D taxonomy
   * @param {boolean} [opts.executable]
   */
  constructor(opts) {
    this.id = opts.id;
    this.architecture = opts.architecture;
    this.capabilities = { ...opts.capabilities };
    this.category = opts.category || 'A';
    this.executable = opts.executable !== false;
    this.metrics = {
      observeCalls: 0,
      readCalls: 0,
      writeCalls: 0,
      shareCalls: 0,
      forkCalls: 0,
      mergeCalls: 0,
      materializeCalls: 0,
      predictCalls: 0,
      simulateCalls: 0,
      resetCalls: 0,
      bytesShared: 0,
      bytesMaterialized: 0,
      conflicts: 0,
      reconstructions: 0,
    };
  }

  capability(op) {
    return this.capabilities[op] || CAPABILITY.UNAVAILABLE;
  }

  assertCapable(op) {
    const c = this.capability(op);
    if (c === CAPABILITY.UNAVAILABLE) {
      throw new UnsupportedWorldOpError(op, this.architecture);
    }
    return c;
  }

  observe(agentId) {
    this.assertCapable('observe');
    this.metrics.observeCalls += 1;
    return this._observe(agentId);
  }
  read_state(query) {
    this.assertCapable('read_state');
    this.metrics.readCalls += 1;
    return this._read_state(query);
  }
  write_state(update) {
    this.assertCapable('write_state');
    this.metrics.writeCalls += 1;
    return this._write_state(update);
  }
  predict(actionSequence) {
    this.assertCapable('predict');
    this.metrics.predictCalls += 1;
    return this._predict(actionSequence);
  }
  simulate(actionSequence) {
    this.assertCapable('simulate');
    this.metrics.simulateCalls += 1;
    return this._simulate(actionSequence);
  }
  share(agentId, information) {
    this.assertCapable('share');
    this.metrics.shareCalls += 1;
    return this._share(agentId, information);
  }
  fork(agentId) {
    this.assertCapable('fork');
    this.metrics.forkCalls += 1;
    return this._fork(agentId);
  }
  merge(agentUpdates) {
    this.assertCapable('merge');
    this.metrics.mergeCalls += 1;
    return this._merge(agentUpdates);
  }
  materialize(agentId) {
    this.assertCapable('materialize');
    this.metrics.materializeCalls += 1;
    this.metrics.reconstructions += 1;
    return this._materialize(agentId);
  }
  reset() {
    this.assertCapable('reset');
    this.metrics.resetCalls += 1;
    return this._reset();
  }

  snapshotMetrics() {
    return { ...this.metrics, architecture: this.architecture, id: this.id };
  }

  // subclasses override
  _observe() {
    throw new UnsupportedWorldOpError('observe', this.architecture);
  }
  _read_state() {
    throw new UnsupportedWorldOpError('read_state', this.architecture);
  }
  _write_state() {
    throw new UnsupportedWorldOpError('write_state', this.architecture);
  }
  _predict() {
    throw new UnsupportedWorldOpError('predict', this.architecture);
  }
  _simulate() {
    throw new UnsupportedWorldOpError('simulate', this.architecture);
  }
  _share() {
    throw new UnsupportedWorldOpError('share', this.architecture);
  }
  _fork() {
    throw new UnsupportedWorldOpError('fork', this.architecture);
  }
  _merge() {
    throw new UnsupportedWorldOpError('merge', this.architecture);
  }
  _materialize() {
    throw new UnsupportedWorldOpError('materialize', this.architecture);
  }
  _reset() {
    throw new UnsupportedWorldOpError('reset', this.architecture);
  }
}

export function measureJsonBytes(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}
