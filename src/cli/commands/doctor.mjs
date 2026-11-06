/** Report the workstation, its optional toolchain, and any accelerator present. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePython } from '../../labs/python-runner.mjs';
import { checkCloud, checkGit } from '../../platform/prereqs.mjs';

export function doctor(ctx) {
  const { log, config, root, shareTo } = ctx;
  log(`${config.product} Workstation ${config.version} (${config.edition}) · doctor`);
  log(`workstation: ${root}`);
  log(`config: ${config.configOk ? 'OK' : 'defaults'}`);
  log(`suite: ${config.suite} ${fs.existsSync(config.suite) ? 'OK' : 'MISSING'}`);
  log(`docs: ${fs.existsSync(path.join(root, 'docs')) ? 'OK' : 'optional'}`);
  log(`node: ${process.version}`);
  const python = resolvePython({ explicit: process.env.TINY_FOOTPRINT_PYTHON });
  const probe = spawnSync(python.command, [...python.prefixArgs, '--version'], { encoding: 'utf8', timeout: 5000 });
  log(`python: ${probe.status === 0 ? (probe.stdout || probe.stderr || '').trim() : 'not found (optional for GPU labs)'}`);
  const smi = spawnSync('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader'], {
    encoding: 'utf8',
    timeout: 5000,
  });
  if (smi.status === 0) log(`gpu: ${(smi.stdout || '').trim()}`);
  else log('gpu: nvidia-smi not available (GPU labs will report not_run; CPU benchmarks still work)');
  log(`share recipient: ${shareTo}`);
  log('doctor complete');
  const git = checkGit(ctx.root);
  const cloud = checkCloud(process.env);
  log(`git · ${git.ok ? git.version : git.error}${git.inRepo ? ' · repo OK' : ' · not in a repo (try will use sandbox)'}`);
  log(`cloud · ${cloud.ok ? cloud.provider + ' token OK' : 'token missing — set FRACTISI_CLOUD_TOKEN or VERCEL_TOKEN'}`);
  return 0;
}
