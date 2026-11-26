#!/usr/bin/env node
/**
 * Package Neural X-Ray + rhyme research suites as self-contained standalone
 * trees, then push to FractiAI/synthobs-* when those GitHub repos exist.
 *
 * Usage:
 *   node scripts/publish-rhyme-standalones.mjs              # package only
 *   node scripts/publish-rhyme-standalones.mjs --push       # package + push existing repos
 *   node scripts/publish-rhyme-standalones.mjs --list
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'output', 'standalones');

/** @typedef {{ slug: string, suite: string, repo: string, title: string, engine?: string, paper: string, npmName: string, description: string }} StandaloneSpec */

/** @type {StandaloneSpec[]} */
export const RHYME_STANDALONES = [
  {
    slug: 'neural-xray-rhyme',
    suite: 'research/neural-xray-rhyme',
    repo: 'FractiAI/synthobs-neural-xray-rhyme',
    title: 'Neural X-Ray Rhyme',
    engine: 'src/engine/rhyming/neural-xray-rhyme.mjs',
    paper: 'content/papers/neural-xray-rhyme.md',
    npmName: 'synthobs-neural-xray-rhyme',
    description: 'Neural X-Ray Rhyme · ENGINE_SHELF #58 Soft Story + live-MLP decisive protocol',
  },
  {
    slug: 'principal-rhyme-theorem',
    suite: 'research/principal-rhyme-theorem',
    repo: 'FractiAI/synthobs-principal-rhyme-theorem',
    title: 'Principal Rhyme Theorem',
    engine: 'src/engine/rhyming/principal-rhyme-theorem.mjs',
    paper: 'content/papers/principal-rhyme-theorem.md',
    npmName: 'synthobs-principal-rhyme-theorem',
    description: 'Principal Rhyme Theorem · ENGINE_SHELF #55',
  },
  {
    slug: 'universal-rhyme-wet-lab',
    suite: 'research/universal-rhyme-wet-lab',
    repo: 'FractiAI/synthobs-universal-rhyme-wet-lab',
    title: 'Universal Rhyme Wet-Lab',
    engine: 'src/engine/rhyming/universal-rhyme-wet-lab.mjs',
    paper: 'content/papers/universal-rhyme-wet-lab.md',
    npmName: 'synthobs-universal-rhyme-wet-lab',
    description: 'Universal Rhyme Wet-Lab Proof · ENGINE_SHELF #56',
  },
  {
    slug: 'compositional-wet-lab-scale',
    suite: 'research/compositional-wet-lab-scale',
    repo: 'FractiAI/synthobs-compositional-wet-lab-scale',
    title: 'Compositional Wet-Lab Scale',
    engine: 'src/engine/rhyming/compositional-wet-lab-scale.mjs',
    paper: 'content/papers/compositional-wet-lab-scale.md',
    npmName: 'synthobs-compositional-wet-lab-scale',
    description: 'Compositional Wet-Lab Scale · ENGINE_SHELF #57',
  },
  {
    slug: 'llm-rhyme-cosmic-genome',
    suite: 'research/llm-rhyme-cosmic-genome-expedition',
    repo: 'FractiAI/synthobs-llm-rhyme-cosmic-genome-expedition',
    title: 'LLM Rhyme Cosmic Genome',
    paper: 'content/papers/llm-rhyme-cosmic-genome.md',
    npmName: 'synthobs-llm-rhyme-cosmic-genome-expedition',
    description: 'LLM / language-pack rhyme · ENGINE_SHELF #54',
  },
  {
    slug: 'cosmic-rhyme-expedition',
    suite: 'research/cosmic-rhyme-expedition',
    repo: 'FractiAI/synthobs-cosmic-rhyme-expedition',
    title: 'Cosmic Rhyme Expedition',
    paper: 'content/papers/cosmic-rhyme-expedition.md',
    npmName: 'synthobs-cosmic-rhyme-expedition',
    description: 'Cosmic Rhyme Expedition Soft Story suite',
  },
  {
    slug: 'cancer-rhyme-expedition',
    suite: 'research/cancer-rhyme-expedition',
    repo: 'FractiAI/synthobs-cancer-rhyme-expedition',
    title: 'Cancer Rhyme Expedition',
    paper: 'content/papers/cancer-rhyme-expedition.md',
    npmName: 'synthobs-cancer-rhyme-expedition',
    description: 'Cancer Rhyme Expedition Soft Story suite',
  },
  {
    slug: 'relational-continuity-rhyme',
    suite: 'research/relational-continuity-rhyme',
    repo: 'FractiAI/synthobs-relational-continuity-rhyme',
    title: 'Relational Continuity Rhyme',
    paper: 'content/papers/relational-continuity-rhyme.md',
    npmName: 'synthobs-relational-continuity-rhyme',
    description: 'Relational Continuity Rhyme Soft Story suite',
  },
  {
    slug: 'pilot-rhyme-expedition',
    suite: 'research/pilot-rhyme-expedition',
    repo: 'FractiAI/synthobs-pilot-rhyme-expedition',
    title: 'Pilot Rhyme Expedition',
    paper: 'content/papers/pilot-rhyme-expedition.md',
    npmName: 'synthobs-pilot-rhyme-expedition',
    description: 'Pilot Rhyme Expedition Soft Story suite',
  },
  {
    slug: 'diverse-redundancy-inbreeding',
    suite: 'research/diverse-redundancy-inbreeding',
    repo: 'FractiAI/synthobs-diverse-redundancy-inbreeding',
    title: 'Diverse Redundancy vs Inbreeding',
    paper: 'content/papers/diverse-redundancy-inbreeding.md',
    npmName: 'synthobs-diverse-redundancy-inbreeding',
    description: 'Diverse redundancy vs cloned copies Soft Story suite',
  },
  {
    slug: 'adversarial-world',
    suite: 'research/adversarial-world',
    repo: 'FractiAI/synthobs-adversarial-world',
    title: 'Adversarial World',
    paper: 'content/papers/adversarial-world.md',
    npmName: 'synthobs-adversarial-world',
    description: 'Adversarial World Soft Story rhyme board',
  },
];

const SKIP = new Set(['node_modules', '.git', 'index.html']);

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (SKIP.has(name)) continue;
    const from = join(src, name);
    const to = join(dest, name);
    const st = statSync(from);
    if (st.isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

function rewriteEngineImports(dir, engineFileName) {
  const needle = `../../../src/engine/rhyming/${engineFileName}`;
  const replacement = `./vendor/${engineFileName}`;
  const walk = (p) => {
    for (const name of readdirSync(p)) {
      const full = join(p, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (name === 'vendor') continue;
        walk(full);
        continue;
      }
      if (!name.endsWith('.mjs')) continue;
      let text = readFileSync(full, 'utf8');
      if (!text.includes(needle)) continue;
      text = text.split(needle).join(replacement);
      // experiments under src/ → vendor is sibling
      if (full.includes(`${dir}/src/`)) {
        text = text.split(`./vendor/${engineFileName}`).join(`./vendor/${engineFileName}`);
        // scripts used ../../../; src used ../../../ — after first rewrite both got ./vendor
        // but src needs ./vendor (same folder level as experiments) — vendor lives in src/vendor
      }
      writeFileSync(full, text);
    }
  };
  walk(dir);
  // Fix: put vendor under src/ and make imports from src/*.mjs use './vendor/...'
  // scripts use '../src/vendor/...'
  const srcDir = join(dir, 'src');
  if (!existsSync(srcDir)) return;
  for (const name of readdirSync(srcDir)) {
    if (!name.endsWith('.mjs')) continue;
    const full = join(srcDir, name);
    let text = readFileSync(full, 'utf8');
    text = text.replaceAll(
      `from './vendor/${engineFileName}'`,
      `from './vendor/${engineFileName}'`,
    );
    writeFileSync(full, text);
  }
  const scriptsDir = join(dir, 'scripts');
  if (!existsSync(scriptsDir)) return;
  for (const name of readdirSync(scriptsDir)) {
    if (!name.endsWith('.mjs')) continue;
    const full = join(scriptsDir, name);
    let text = readFileSync(full, 'utf8');
    if (text.includes(`from './vendor/${engineFileName}'`)) {
      text = text.replaceAll(
        `from './vendor/${engineFileName}'`,
        `from '../src/vendor/${engineFileName}'`,
      );
      writeFileSync(full, text);
    }
  }
}

/** Point REPO_ROOT at the standalone root and freeze the kit analysis summary. */
function shipKitAnalysisSummary(dir) {
  const kitSummary = join(ROOT, 'output/data/analysis_summary.json');
  if (!existsSync(kitSummary)) return;
  mkdirSync(join(dir, 'output/data'), { recursive: true });
  cpSync(kitSummary, join(dir, 'output/data/analysis_summary.json'));
}

function retargetRepoRoot(filePath) {
  if (!existsSync(filePath)) return;
  let text = readFileSync(filePath, 'utf8');
  text = text.replace(
    "const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');",
    "const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');",
  );
  writeFileSync(filePath, text);
}

function fixMeasuredBaselines(dir) {
  retargetRepoRoot(join(dir, 'src', 'measured-baselines.mjs'));
  shipKitAnalysisSummary(dir);
}

function fixCompositionalBaselines(dir) {
  retargetRepoRoot(join(dir, 'src', 'level3-baselines.mjs'));
  shipKitAnalysisSummary(dir);
}

/** LLM suite loads Cosmic fixtures from a sibling path — vendor them beside load.mjs. */
function vendorCosmicFixturesForLlm(dest) {
  const cosmicFixtures = join(ROOT, 'research/cosmic-rhyme-expedition/fixtures');
  const target = join(dest, 'vendor-cosmic-fixtures');
  mkdirSync(target, { recursive: true });
  copyTree(cosmicFixtures, target);
  const loadPath = join(dest, 'src/load.mjs');
  if (!existsSync(loadPath)) return;
  let text = readFileSync(loadPath, 'utf8');
  text = text.replace(
    `export const COSMIC_FIXTURES = join(
  root,
  '..',
  'cosmic-rhyme-expedition',
  'fixtures',
);`,
    `export const COSMIC_FIXTURES = join(root, 'vendor-cosmic-fixtures');`,
  );
  writeFileSync(loadPath, text);
}

/** Pilot reuses Cosmic + LLM fixture loaders from sibling suites. */
function vendorPilotFixtureLoaders(dest) {
  const vendorRoot = join(dest, 'vendor');
  const llmSrc = join(ROOT, 'research/llm-rhyme-cosmic-genome-expedition');
  const cosmicSrc = join(ROOT, 'research/cosmic-rhyme-expedition');
  mkdirSync(join(vendorRoot, 'llm-rhyme-cosmic-genome-expedition/src'), { recursive: true });
  mkdirSync(join(vendorRoot, 'llm-rhyme-cosmic-genome-expedition/fixtures'), { recursive: true });
  mkdirSync(join(vendorRoot, 'cosmic-rhyme-expedition/fixtures'), { recursive: true });
  cpSync(join(llmSrc, 'src/load.mjs'), join(vendorRoot, 'llm-rhyme-cosmic-genome-expedition/src/load.mjs'));
  copyTree(join(llmSrc, 'fixtures'), join(vendorRoot, 'llm-rhyme-cosmic-genome-expedition/fixtures'));
  copyTree(join(cosmicSrc, 'fixtures'), join(vendorRoot, 'cosmic-rhyme-expedition/fixtures'));

  // load.mjs resolves cosmic fixtures via ../cosmic-rhyme-expedition — keep that layout under vendor/
  const theaters = join(dest, 'src/theaters.mjs');
  if (existsSync(theaters)) {
    let text = readFileSync(theaters, 'utf8');
    text = text.replace(
      "from '../../llm-rhyme-cosmic-genome-expedition/src/load.mjs'",
      "from '../vendor/llm-rhyme-cosmic-genome-expedition/src/load.mjs'",
    );
    writeFileSync(theaters, text);
  }
}

function writeStandaloneMeta(spec, dest) {
  const licenseSrc = join(ROOT, 'research/synthobs-tiny-gateway-rhyming-templates/LICENSE');
  cpSync(licenseSrc, join(dest, 'LICENSE'));

  writeFileSync(
    join(dest, 'package.json'),
    `${JSON.stringify(
      {
        name: spec.npmName,
        version: '1.0.0',
        private: true,
        type: 'module',
        description: spec.description,
        repository: { type: 'git', url: `https://github.com/${spec.repo}.git` },
        license: 'MIT',
        scripts: {
          research: 'node scripts/run_empirical_pipeline.mjs',
        },
      },
      null,
      2,
    )}\n`,
  );

  const paperName = spec.paper.endsWith('.md')
    ? `${spec.slug}.md`
    : `${spec.slug}.html`;
  mkdirSync(join(dest, 'paper'), { recursive: true });
  if (existsSync(join(ROOT, spec.paper))) {
    cpSync(join(ROOT, spec.paper), join(dest, 'paper', paperName));
  }

  const readme = `# ${spec.title}

Standalone reproduction suite for the FractiSI Multi-Agent paper.

| Field | Value |
|-------|--------|
| Kit mirror | [\`FractiAI/FractiSI-Multi-Agent\`](https://github.com/FractiAI/FractiSI-Multi-Agent) · \`${spec.suite}/\` |
| Standalone | [\`${spec.repo}\`](https://github.com/${spec.repo}) |
| Paper | [\`paper/${paperName}\`](paper/${paperName}) |

## Run

\`\`\`bash
npm run research
\`\`\`

Writes \`data/empirical_report.json\` (and markdown companion when the suite emits one).

## Honesty

Results come from receipts produced by this package. When \`output/data/analysis_summary.json\` is present it is the **frozen kit receipt** from the FractiSI Multi-Agent publish cut — re-run the workstation measured pipeline for a fresh host-local tier.

→ ∞^∞
`;
  writeFileSync(join(dest, 'README.md'), readme);

  writeFileSync(
    join(dest, 'STATUS.md'),
    `# Status

Standalone package of \`${spec.suite}\` from FractiSI Multi-Agent.
Published for third-party reproduction of the paper tests.
`,
  );
}

/**
 * @param {StandaloneSpec} spec
 */
export function packageStandalone(spec) {
  const src = join(ROOT, spec.suite);
  if (!existsSync(src)) throw new Error(`missing suite ${spec.suite}`);
  const dest = join(OUT, spec.npmName);
  rmSync(dest, { recursive: true, force: true });
  copyTree(src, dest);

  if (spec.engine) {
    const engineName = spec.engine.split('/').pop();
    const vendorDir = join(dest, 'src', 'vendor');
    mkdirSync(vendorDir, { recursive: true });
    cpSync(join(ROOT, spec.engine), join(vendorDir, engineName));
    rewriteEngineImports(dest, engineName);
  }
  if (spec.slug === 'neural-xray-rhyme') fixMeasuredBaselines(dest);
  if (spec.slug === 'compositional-wet-lab-scale') fixCompositionalBaselines(dest);
  if (spec.slug === 'llm-rhyme-cosmic-genome') vendorCosmicFixturesForLlm(dest);
  if (spec.slug === 'pilot-rhyme-expedition') vendorPilotFixtureLoaders(dest);
  writeStandaloneMeta(spec, dest);
  return dest;
}

function repoExists(repo) {
  const r = spawnSync('gh', ['api', `repos/${repo}`, '--jq', '.full_name'], {
    encoding: 'utf8',
  });
  return r.status === 0 && r.stdout.trim() === repo;
}

function pushStandalone(spec, dest) {
  const gitDir = join(dest, '.git');
  rmSync(gitDir, { recursive: true, force: true });
  const run = (args, opts = {}) => {
    const r = spawnSync('git', args, { cwd: dest, encoding: 'utf8', ...opts });
    if (r.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
    }
    return r;
  };
  run(['init', '-b', 'main']);
  run(['add', '.']);
  run(['commit', '-m', `Publish ${spec.npmName} standalone reproduction suite.`], {
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'FractiAI',
      GIT_AUTHOR_EMAIL: 'noreply@fractiai.com',
      GIT_COMMITTER_NAME: 'FractiAI',
      GIT_COMMITTER_EMAIL: 'noreply@fractiai.com',
    },
  });
  run(['remote', 'add', 'origin', `https://github.com/${spec.repo}.git`]);
  const push = spawnSync('git', ['push', '-u', 'origin', 'main', '--force'], {
    cwd: dest,
    encoding: 'utf8',
  });
  if (push.status !== 0) {
    throw new Error(`push ${spec.repo} failed: ${push.stderr || push.stdout}`);
  }
  return true;
}

function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--list')) {
    for (const s of RHYME_STANDALONES) {
      console.log(`${s.slug}\t${s.repo}\t${s.suite}`);
    }
    return;
  }
  mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const spec of RHYME_STANDALONES) {
    const dest = packageStandalone(spec);
    const exists = repoExists(spec.repo);
    let pushed = false;
    let error = null;
    if (args.has('--push')) {
      if (!exists) {
        error = 'repo_missing';
      } else {
        try {
          pushStandalone(spec, dest);
          pushed = true;
        } catch (e) {
          error = String(e.message || e);
        }
      }
    }
    results.push({
      slug: spec.slug,
      repo: spec.repo,
      dest: relative(ROOT, dest),
      exists,
      pushed,
      error,
    });
    console.log(
      `${spec.slug}: packaged → ${relative(ROOT, dest)}` +
        (args.has('--push')
          ? exists
            ? pushed
              ? ' · pushed'
              : ` · push_failed (${error})`
            : ' · repo_missing (create on GitHub then re-run --push)'
          : ''),
    );
  }
  writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify({ results }, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('publish-rhyme-standalones.mjs')) {
  main();
}
