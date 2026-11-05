/**
 * Product configuration and package metadata, with documented defaults.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, REPO_ROOT, SUITE_NAME } from './paths.mjs';

/**
 * Read JSON, or return `{}` when the file is absent or malformed. For optional
 * configuration only: evidence readers must not use this, because an empty
 * object is indistinguishable from a successful read of nothing.
 *
 * @param {string} file
 */
export function readOptionalJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

/** @param {{configPath?: string, packagePath?: string}} [overrides] */
export function loadProductConfig(overrides = {}) {
  const configPath = overrides.configPath ?? PATHS.config;
  const config = readOptionalJson(configPath);
  const pkg = readOptionalJson(overrides.packagePath ?? PATHS.packageJson);
  const suiteRelative = config?.benchmark?.suiteRelative;
  return {
    raw: config,
    configPath,
    configOk: fs.existsSync(configPath) && Object.keys(config).length > 0,
    product: config.product || 'Tiny Footprint',
    version: pkg.version || '0.1.0',
    edition: config.edition || 'community',
    headline: config.headline || 'Less Memory. Lower Latency. More AI Performance.',
    suite:
      typeof suiteRelative === 'string' && suiteRelative.length > 0
        ? path.resolve(path.dirname(configPath), suiteRelative)
        : path.join(REPO_ROOT, 'research', SUITE_NAME),
    forceLlmLabDefault: config?.benchmark?.forceLlmLab === true,
    honesty: {
      localGpuNotHbm: config?.honesty?.localGpuNotHbm === true,
      notHostedFrontierBakeoff: config?.honesty?.notHostedFrontierBakeoff === true,
    },
  };
}
