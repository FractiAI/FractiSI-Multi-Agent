/** Stage body: build the token catalog, enforce the contract, and hydrate the manuscript. */
import fs from 'node:fs';
import path from 'node:path';
import { loadPlan } from '../benchmarks/plan.mjs';
import { sha256File } from '../core/canonical-json.mjs';
import { PATHS } from '../core/paths.mjs';
import { scanManuscript } from './contract.mjs';
import { writeFormalismLedger } from './formalism.mjs';
import { writeHydratedManuscript } from './hydrate.mjs';
import { buildCatalog, variablesFrom, writeCatalog } from './tokens.mjs';

export function readHydrationInputs({ dataDir = PATHS.outputData, figuresDir = PATHS.outputFigures } = {}) {
  const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    summaryPath: path.join(dataDir, 'analysis_summary.json'),
    registryPath: path.join(figuresDir, 'figure_registry.json'),
    summary: read(path.join(dataDir, 'analysis_summary.json')),
    registry: read(path.join(figuresDir, 'figure_registry.json')),
    suite: read(path.join(dataDir, 'suite', 'manifest.json')),
  };
}

/** @param {{sourceDir?: string, outDir?: string, dataDir?: string, figuresDir?: string}} [options] */
export function hydrateProject({
  sourceDir = PATHS.manuscriptSource,
  outDir = PATHS.outputManuscript,
  dataDir = PATHS.outputData,
  figuresDir = PATHS.outputFigures,
} = {}) {
  const findings = scanManuscript(sourceDir);
  if (findings.length > 0) {
    throw new Error(`hard-coded study values in authored sections:\n${findings.map((f) => `- ${f.file}: ${f.kind} "${f.value}"${f.context ? ` near "${f.context}"` : ''}`).join('\n')}`);
  }
  const inputs = readHydrationInputs({ dataDir, figuresDir });
  const { plan, sha256: planSha256 } = loadPlan();
  const entries = buildCatalog(inputs.summary, { plan, planSha256, registry: inputs.registry, suite: inputs.suite });
  const variablesSha = writeCatalog(dataDir, entries);
  writeFormalismLedger(dataDir, sourceDir);
  const manifest = writeHydratedManuscript({
    sourceDir,
    outDir,
    variables: variablesFrom(entries),
    bindings: {
      analysisSummary: sha256File(inputs.summaryPath),
      figureRegistry: sha256File(inputs.registryPath),
      variables: variablesSha,
      plan: planSha256,
    },
  });
  return { tokens: entries.length, sections: Object.keys(manifest.hydrated).length, outDir };
}
