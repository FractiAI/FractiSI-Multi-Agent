/**
 * The measuring host, without identifying it: no hostname, username or path, so
 * measured receipts can be committed. Load average is recorded because concurrent
 * work on the machine is a threat to the validity of timing results.
 */
import os from 'node:os';

export function describeHost() {
  const cpus = os.cpus();
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: cpus[0]?.model ?? 'unknown',
    logicalCores: cpus.length,
    totalMemoryBytes: os.totalmem(),
    node: process.version,
    v8: process.versions.v8,
    pointerBytes: process.arch.endsWith('64') ? 8 : 4,
  };
}

export function loadSample() {
  const [one, five, fifteen] = os.loadavg();
  return { at: new Date().toISOString(), loadAverage: { one, five, fifteen } };
}
