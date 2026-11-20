#!/usr/bin/env node
/**
 * Build regenerable pan-cancer Soft Story worlds.
 * Labels: fixed public TCGA project abbreviations (stable Soft Story board).
 * Optional GDC enrichment for primary_site when reachable.
 * Hallmarks are NOT discovery features.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AGENTS_PER_WORLD,
  EDGES_PER_WORLD,
  N_CANCERS,
  PLANTED_MOTIF_COUNT,
  SEED,
} from '../src/constants.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIX = join(ROOT, 'fixtures');
mkdirSync(FIX, { recursive: true });

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TCGA_LABELS = [
  ['TCGA-BRCA', 'Breast'],
  ['TCGA-LUAD', 'Lung'],
  ['TCGA-LUSC', 'Lung'],
  ['TCGA-COAD', 'Colon'],
  ['TCGA-READ', 'Rectum'],
  ['TCGA-STAD', 'Stomach'],
  ['TCGA-LIHC', 'Liver'],
  ['TCGA-PAAD', 'Pancreas'],
  ['TCGA-PRAD', 'Prostate'],
  ['TCGA-OV', 'Ovary'],
  ['TCGA-UCEC', 'Uterus'],
  ['TCGA-CESC', 'Cervix'],
  ['TCGA-BLCA', 'Bladder'],
  ['TCGA-KIRC', 'Kidney'],
  ['TCGA-KIRP', 'Kidney'],
  ['TCGA-THCA', 'Thyroid'],
  ['TCGA-GBM', 'Brain'],
  ['TCGA-LGG', 'Brain'],
  ['TCGA-SKCM', 'Skin'],
  ['TCGA-HNSC', 'Head and neck'],
  ['TCGA-ESCA', 'Esophagus'],
  ['TCGA-SARC', 'Soft tissue'],
  ['TCGA-LAML', 'Blood'],
  ['TCGA-DLBC', 'Lymph node'],
];

const MOTIF_TEMPLATES = [
  { id: 'M1', roles: ['local_agent', 'neighbor', 'resource'], edges: [['local_agent', 'competes', 'neighbor'], ['local_agent', 'consumes', 'resource'], ['neighbor', 'consumes', 'resource']] },
  { id: 'M2', roles: ['signal', 'receptor', 'response'], edges: [['signal', 'activates', 'receptor'], ['receptor', 'drives', 'response']] },
  { id: 'M3', roles: ['boundary', 'inside', 'outside'], edges: [['boundary', 'separates', 'inside'], ['boundary', 'separates', 'outside'], ['inside', 'leaks_to', 'outside']] },
  { id: 'M4', roles: ['local_opt', 'shared_constraint', 'penalty'], edges: [['local_opt', 'ignores', 'shared_constraint'], ['local_opt', 'increases', 'penalty']] },
  { id: 'M5', roles: ['seed_state', 'bridge', 'edge_pheno'], edges: [['seed_state', 'leads_to', 'bridge'], ['bridge', 'leads_to', 'edge_pheno']] },
  { id: 'M6', roles: ['immune', 'tumor', 'escape'], edges: [['immune', 'targets', 'tumor'], ['tumor', 'evades', 'immune'], ['tumor', 'enables', 'escape']] },
];

function structuralFingerprint(motifEdges) {
  const rels = motifEdges.map(([, r]) => r).sort();
  const nRoles = new Set(motifEdges.flatMap(([a, , b]) => [a, b])).size;
  return `R${nRoles}|${rels.join(',')}`;
}

function buildWorlds(rand) {
  const motifs = MOTIF_TEMPLATES.slice(0, PLANTED_MOTIF_COUNT);
  const cancers = TCGA_LABELS.slice(0, N_CANCERS).map(([projectId, primarySite]) => ({
    projectId,
    primarySite,
  }));

  // Each motif shared by 8–12 cancers (guaranteed cross-cancer)
  const motifOwners = {};
  for (let mi = 0; mi < motifs.length; mi++) {
    const m = motifs[mi];
    const owners = [];
    for (let i = 0; i < cancers.length; i++) {
      if ((i + mi) % 3 !== mi % 3) owners.push(cancers[i].projectId);
    }
    // ensure at least 8
    while (owners.length < 8) {
      const c = cancers[Math.floor(rand() * cancers.length)].projectId;
      if (!owners.includes(c)) owners.push(c);
    }
    motifOwners[m.id] = owners.slice(0, 12);
  }

  const worlds = [];
  for (const c of cancers) {
    const agents = [];
    for (let i = 0; i < AGENTS_PER_WORLD; i++) {
      agents.push({
        id: `${c.projectId}:a${i}`,
        kind: ['tumor', 'immune', 'stromal', 'endothelial', 'molecule'][i % 5],
        localOpt: Number((0.25 + rand() * 0.5).toFixed(3)),
        sharedCompat: Number((0.25 + rand() * 0.5).toFixed(3)),
        integration: Number((0.2 + rand() * 0.6).toFixed(3)),
        differentiation: Number((0.2 + rand() * 0.6).toFixed(3)),
        boundary: Number((0.15 + rand() * 0.7).toFixed(3)),
      });
    }

    const edges = [];
    // Noise edges use a disjoint relation vocabulary from planted motifs
    const noiseRels = ['contacts', 'exchanges', 'proximity', 'modulates', 'binds_weak'];
    for (let e = 0; e < EDGES_PER_WORLD; e++) {
      const ai = Math.floor(rand() * agents.length);
      let bi = Math.floor(rand() * agents.length);
      if (bi === ai) bi = (ai + 1) % agents.length;
      edges.push({
        from: agents[ai].id,
        rel: noiseRels[Math.floor(rand() * noiseRels.length)],
        to: agents[bi].id,
        planted: null,
      });
    }

    const plantedHere = motifs.filter((m) => motifOwners[m.id].includes(c.projectId));
    for (const m of plantedHere) {
      const roleMap = {};
      m.roles.forEach((role, i) => {
        roleMap[role] = agents[i].id;
      });
      const fp = structuralFingerprint(m.edges);
      for (const [ra, rel, rb] of m.edges) {
        edges.push({
          from: roleMap[ra],
          rel,
          to: roleMap[rb],
          planted: m.id,
          fingerprint: fp,
        });
      }
      if (m.id === 'M4') {
        for (const a of agents.slice(0, 5)) {
          a.localOpt = Number((0.82 + rand() * 0.15).toFixed(3));
          a.sharedCompat = Number((0.05 + rand() * 0.18).toFixed(3));
          a.integration = Number((0.08 + rand() * 0.22).toFixed(3));
          a.boundary = Number((0.05 + rand() * 0.2).toFixed(3));
        }
      }
    }

    const hasM5 = plantedHere.some((m) => m.id === 'M5');
    const hasM4 = plantedHere.some((m) => m.id === 'M4');
    const hasM6 = plantedHere.some((m) => m.id === 'M6');
    let edgePhenotype = 'indeterminate';
    if (hasM5 && hasM4) edgePhenotype = 'resistant_high_local_opt';
    else if (hasM5 && hasM6) edgePhenotype = 'immune_escape_progressed';
    else if (hasM5) edgePhenotype = 'progressed_relational';
    else if (hasM4) edgePhenotype = 'local_opt_stress';

    worlds.push({
      cancerId: c.projectId,
      primarySite: c.primarySite,
      agents,
      edges,
      plantedMotifs: plantedHere.map((m) => m.id).sort(),
      seedState: hasM5 ? 'seed_relational_M5' : 'seed_noise',
      edgePhenotype,
    });
  }

  return {
    seed: SEED,
    labelSource: 'public-TCGA-project-abbreviations',
    motifs: motifs.map((m) => ({
      ...m,
      fingerprint: structuralFingerprint(m.edges),
      owners: motifOwners[m.id],
    })),
    motifOwners,
    worlds,
    honesty:
      'Synthetic relational worlds labeled with public TCGA project abbreviations. Planted motifs are abstract role-graphs. Hallmarks not used as discovery features. Not patient data / not clinical findings.',
  };
}

const rand = mulberry32(SEED);
const fixture = buildWorlds(rand);
writeFileSync(join(FIX, 'pancancer_worlds.json'), JSON.stringify(fixture));
writeFileSync(
  join(FIX, 'gdc_labels.json'),
  JSON.stringify(
    {
      source: 'public-TCGA-project-abbreviations',
      note: 'Stable Soft Story labels; GDC live pull optional and not required for regenerability.',
      hits: TCGA_LABELS.map(([projectId, primarySite]) => ({ projectId, primarySite })),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      ok: true,
      cancers: fixture.worlds.length,
      motifs: fixture.motifs.length,
      phenotypes: [...new Set(fixture.worlds.map((w) => w.edgePhenotype))],
      path: 'fixtures/pancancer_worlds.json',
    },
    null,
    2,
  ),
);
