/** Resolve the operator project root for workload / in-repo commands. */
import path from 'node:path';

export function flagValue(argv, name) {
  const i = argv.indexOf(name);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('-')) return argv[i + 1];
  return null;
}

/**
 * --repo <path> wins.
 * For --workload / --in-place, default to process.cwd() (Daniel's project).
 * Otherwise fall back to the kit root from context.
 */
export function resolveProjectRoot(ctx, { workload = false } = {}) {
  const fromFlag = flagValue(ctx.argv, '--repo');
  if (fromFlag) return path.resolve(fromFlag);
  if (workload || ctx.flag('--workload') || ctx.flag('--in-place')) {
    return path.resolve(process.cwd());
  }
  return ctx.root;
}
