/**
 * FractiSI Multi-Agent platform surface names (audience-facing).
 * Audience-facing names only — never letter codes in Test Drive / product copy.
 *
 * Tiny Footprint = shared-world execution core.
 * Then: Coordination · Shared state · Composition · Git awareness · Deploy.
 */

export const PLATFORM_LAYERS = Object.freeze([
  {
    id: 'tiny-footprint',
    name: 'Tiny Footprint',
    short: 'shared world once · per-agent deltas',
  },
  {
    id: 'coordination',
    name: 'Coordination',
    short: 'ownership · interference marks · no silent collide',
  },
  {
    id: 'shared-state',
    name: 'Shared state',
    short: 'intentional share across participants',
  },
  {
    id: 'composition',
    name: 'Composition',
    short: 'compose contributions before merge',
  },
  {
    id: 'git-awareness',
    name: 'Git awareness',
    short: 'commits / worktrees on your repo (Community)',
  },
  {
    id: 'deploy',
    name: 'Deploy',
    short: 'approval-gated publish · paid (Team · Enterprise · Cloud)',
  },
]);

/** Full product chain after Rhyming Templates / Tiny Gateway. */
export const PLATFORM_STACK =
  'Tiny Footprint → Coordination · Shared state · Composition · Git awareness · Deploy';

/** Coordination through Composition. */
export const COORD_COMPOSE_STACK = 'Coordination · Shared state · Composition';

/** Local Community path (Deploy stays paid). */
export const COMMUNITY_STACK = 'Tiny Footprint · Coordination · Shared state · Composition · Git awareness';
