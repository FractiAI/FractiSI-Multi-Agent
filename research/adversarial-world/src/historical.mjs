/**
 * Historical Soft Story replay — InjecAgent public attacker-case metadata.
 * Maps tool names + attack type into local simulated ops claims.
 * Does not vendor Attacker Instruction / injection prompt text.
 * Not live tool calls. Not exploit reproduction. Not InjecAgent ASR claim.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORICAL_REPLAY_ID, HISTORICAL_SOURCE, MODEL_IDS } from './constants.mjs';

const FIXTURE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../data/historical/injecagent_soft_story_fixtures.json',
);

export function loadInjecAgentFixtures() {
  const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));
  return {
    meta: {
      documentId: raw.documentId,
      honesty: raw.honesty,
      source: raw.source || HISTORICAL_SOURCE,
      nFixtures: (raw.fixtures || []).length,
    },
    fixtures: raw.fixtures || [],
  };
}

/**
 * Build a Soft Story scenario from one abstracted historical fixture.
 * `builders` must supply createGroundTruth / makeClaim / clone from experiments.
 */
export function buildHistoricalScenario(fixture, { createGroundTruth, makeClaim, clone }) {
  const ground = createGroundTruth();
  const trustedIds = new Set(['trusted_0', 'trusted_1']);
  const delta = { ...(fixture.softStoryDelta || {}) };
  const controllerId = fixture.multiToolChain ? 'injec_correlated_ctrl' : `injec_mal_${fixture.caseId}`;

  const honest = makeClaim({
    agentId: 'honest_hist_0',
    controllerId: 'ctrl_hist_h0',
    sensorId: 'hist_db_ping',
    delta: { db_status: 'healthy', temperature_c: ground.temperature_c },
    evidence: 'ping_ok',
    rhymeFamily: 'db_health',
    confidence: 0.9,
    malicious: false,
  });

  const malicious = makeClaim({
    agentId: `mal_hist_${fixture.caseId}`,
    controllerId,
    sensorId: fixture.multiToolChain ? 'shared_bus_sensor' : `sensor_${fixture.caseId}`,
    delta,
    evidence: 'historical_tool_metadata',
    rhymeFamily: fixture.mappedSoftStoryAttack || 'historical',
    confidence: 0.85,
    malicious: true,
    t: 1,
  });

  // Multi-tool chains Soft Story-echo as correlated chorus (not independent rhyme)
  const chorus = [];
  if (fixture.multiToolChain) {
    for (let i = 0; i < Math.min(3, (fixture.attackerTools || []).length); i++) {
      chorus.push(
        makeClaim({
          agentId: `mal_hist_echo_${i}`,
          controllerId,
          sensorId: 'shared_bus_sensor',
          delta: clone(delta),
          evidence: 'historical_tool_metadata',
          rhymeFamily: fixture.mappedSoftStoryAttack || 'historical',
          confidence: 0.8,
          malicious: true,
          t: 2 + i,
        }),
      );
    }
  }

  return {
    id: `${HISTORICAL_REPLAY_ID}:${fixture.caseId}`,
    label: fixture.caseId,
    historical: true,
    sourceCase: {
      caseId: fixture.caseId,
      paper: fixture.paper,
      attackType: fixture.attackType,
      attackerTools: fixture.attackerTools,
      instructionFingerprint: fixture.instructionFingerprint,
      mappedSoftStoryAttack: fixture.mappedSoftStoryAttack,
    },
    ground,
    claims: [honest, malicious, ...chorus],
    trustedIds,
    goldCanonical: clone(ground),
    expectContainMalicious: true,
    expectAcceptTruth: false,
  };
}

export function runHistoricalReplay({
  createGroundTruth,
  makeClaim,
  clone,
  runScenarioOnModel,
}) {
  const { meta, fixtures } = loadInjecAgentFixtures();
  const rows = [];
  const byCase = [];

  for (const fixture of fixtures) {
    const scenario = buildHistoricalScenario(fixture, { createGroundTruth, makeClaim, clone });
    const models = {};
    for (const mid of MODEL_IDS) {
      const score = runScenarioOnModel(scenario, mid);
      models[mid] = {
        contaminated: score.contaminated,
        contained: score.contained,
        malAccepted: score.malAccepted,
      };
      rows.push({ ...score, historical: true, caseId: fixture.caseId });
    }
    byCase.push({
      caseId: fixture.caseId,
      mappedSoftStoryAttack: fixture.mappedSoftStoryAttack,
      attackType: fixture.attackType,
      attackerTools: fixture.attackerTools,
      instructionFingerprint: fixture.instructionFingerprint,
      models,
    });
  }

  const modelSummary = Object.fromEntries(
    MODEL_IDS.map((mid) => {
      const mine = rows.filter((r) => r.modelId === mid);
      const containmentRate =
        mine.filter((r) => !r.contaminated).length / Math.max(1, mine.length);
      return [
        mid,
        {
          modelId: mid,
          nCases: mine.length,
          containmentRate,
          contaminationRate: 1 - containmentRate,
        },
      ];
    }),
  );

  const full = modelSummary.fractisi_full;
  const majority = modelSummary.majority;
  const naive = modelSummary.naive;
  const beatsMajority = full.containmentRate > majority.containmentRate + 0.1;
  const beatsNaive = full.containmentRate > naive.containmentRate + 0.1;

  return {
    id: HISTORICAL_REPLAY_ID,
    source: meta.source,
    honesty: meta.honesty,
    nFixtures: meta.nFixtures,
    models: modelSummary,
    beatsMajority,
    beatsNaive,
    positiveHistoricalSoftStorySignal: beatsMajority && beatsNaive && full.containmentRate >= 0.7,
    byCase,
  };
}
