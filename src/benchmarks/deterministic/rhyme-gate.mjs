/**
 * What the four-pillar rhyme gate can tell apart, and where the H100 simulation's byte
 * fraction comes from. Two of the pillars read values the caller declares, so the probe
 * asks whether a repeating record with nothing else to it can pass by declaring them.
 */
import { bytesOf } from '../../core/bytes.mjs';
import { auditRhyme, brickWallCandidate } from '../../engine/rhyming/gate.mjs';
import { encodeExpression } from '../../engine/rhyming/index.mjs';
import { RHYME_PATTERN, differingWordSessions } from '../../experiments/rhyme-vs-cache.mjs';
import { RHYME_SHARED_ORG_FRACTION } from '../../experiments/s-h100-rhyme-sim.mjs';

export function rhymeGateProbe() {
  const wall = brickWallCandidate(40);
  const plain = auditRhyme(wall);
  const declared = auditRhyme({
    pattern: { unit: 'brick', index: 0, course: { unit: 'brick', index: 0 } },
    expressions: wall.expressions.map((brick) => ({ ...brick, course: { unit: 'brick', index: brick.index } })),
    nestDepth: 2,
    driftBefore: 0.15,
    driftAfter: 0.05,
  });
  return {
    plainWall: { pass: plain.pass, failed: plain.failed },
    wallWithNestedFieldAndDeclaredValues: { pass: declared.pass, failed: declared.failed },
    pillarsReadingDeclaredValues: ['recursive', 'self_correcting'],
  };
}

export function rhymeByteFraction(sessions = differingWordSessions()) {
  const expressions = sessions.map((session) => encodeExpression('tpl_rhyme_v1', RHYME_PATTERN, session));
  const fullBytes = sessions.reduce((sum, session) => sum + bytesOf(session), 0);
  const expressionBytes = expressions.reduce((sum, expression) => sum + bytesOf(expression), 0);
  return {
    sessions: sessions.length,
    fullBytes,
    expressionBytes,
    cohortSharedFraction: 1 - expressionBytes / fullBytes,
    simulationSharedFraction: RHYME_SHARED_ORG_FRACTION,
  };
}
