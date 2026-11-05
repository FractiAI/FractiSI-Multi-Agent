/** Shared command context: configuration, paths, logging and small helpers. */
import { loadProductConfig } from '../core/config.mjs';
import { PATHS, REPO_ROOT } from '../core/paths.mjs';
import { defaultRecipient } from '../share/packet.mjs';

/** @param {{argv?: string[], log?: (message: string) => void}} [options] */
export function createContext({ argv = process.argv, log = (message) => console.log(`[tiny] ${message}`) } = {}) {
  return {
    argv,
    log,
    root: REPO_ROOT,
    reports: process.env.TINY_FOOTPRINT_REPORTS_DIR || PATHS.reports,
    config: loadProductConfig(),
    shareTo: defaultRecipient(),
    flag: (name) => argv.includes(name),
  };
}

/** @param {object} result outcome from the share path */
export function logShareResult(log, result, label) {
  if (result.emailedViaSmtp) {
    log(`${label} emailed via SMTP → ${result.to}`);
    return;
  }
  if (result.mailtoOpened) {
    log(`${label} mail client opened → ${result.to}`);
    if (result.jsonPath) log(`A mail link cannot attach files. Attach the full packet before sending: ${result.jsonPath}`);
    return;
  }
  log(`${label} not sent — no SMTP and no mail client opened${result.jsonPath ? `; packet: ${result.jsonPath}` : ''}`);
}
