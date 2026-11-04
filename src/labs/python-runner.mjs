/**
 * Run one Python lab script and return only what that invocation produced.
 *
 * The receipt path is a freshly created temporary directory, so a receipt left
 * by an earlier run, or committed from another machine, cannot be mistaken for
 * this run's result. Reading a pre-existing receipt after a failed launch is the
 * exact failure this module exists to prevent: on a host with no GPU that made
 * `tiny benchmark` report a laptop's GeForce measurements as fresh passes.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LAB_STATUS, notRunReport } from './lab-status.mjs';

/** Exit code a lab uses for "cannot run on this host" as opposed to a failure. */
export const LAB_EXIT_NOT_RUN = 3;

/**
 * @param {object} [options]
 * @param {string} [options.explicit] interpreter chosen by the caller
 * @param {string} [options.platform]
 * @returns {{command: string, prefixArgs: string[]}}
 */
export function resolvePython({ explicit, platform = process.platform } = {}) {
  if (explicit) return { command: explicit, prefixArgs: [] };
  return platform === 'win32' ? { command: 'py', prefixArgs: ['-3'] } : { command: 'python3', prefixArgs: [] };
}

/**
 * @param {object} options
 * @param {string} options.script absolute path of the lab script
 * @param {string[]} options.args arguments, excluding `--out`
 * @param {{command: string, prefixArgs: string[]}} options.python
 * @param {number} options.timeoutMs
 * @param {NodeJS.ProcessEnv} [options.env]
 */
export function runLabScript({ script, args, python, timeoutMs, env }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-footprint-lab-'));
  const out = path.join(dir, 'receipt.json');
  try {
    const run = spawnSync(python.command, [...python.prefixArgs, script, ...args, '--out', out], {
      encoding: 'utf8',
      timeout: timeoutMs,
      env: env ?? process.env,
    });
    if (run.error) {
      const code = /** @type {NodeJS.ErrnoException} */ (run.error).code;
      if (code === 'ENOENT') return notRunReport('python_unavailable', `${python.command} not found`);
      return { ok: false, status: LAB_STATUS.FAIL, liveRun: true, error: run.error.message };
    }
    const receipt = readReceipt(out);
    if (receipt && run.status === 0) {
      return { ...receipt, status: receipt.ok ? LAB_STATUS.PASS : LAB_STATUS.FAIL, liveRun: true };
    }
    if (run.status === LAB_EXIT_NOT_RUN) {
      return notRunReport(receipt?.reason ?? 'lab_not_runnable', receipt?.detail ?? run.stderr?.trim());
    }
    return {
      ...(receipt ?? {}),
      ok: false,
      status: LAB_STATUS.FAIL,
      liveRun: true,
      exitCode: run.status,
      error: receipt?.error ?? (run.stderr?.trim() || 'lab_failed_without_receipt'),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function readReceipt(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}
