import assert from 'node:assert/strict';
import test from 'node:test';
import {buildProofClipPlan, PROOF_PHASES, validateProofMarkers} from './proof-plan.mjs';

const markers = PROOF_PHASES.map((phase, index) => ({
  name: phase.marker,
  timeSec: [4, 14, 21, 34, 41][index],
}));

test('builds the five canonical clips with small continuity handles', () => {
  const clips = buildProofClipPlan(markers, 42);
  assert.equal(clips.length, 5);
  assert.deepEqual(clips.map((clip) => clip.clip), PROOF_PHASES.map((phase) => phase.clip));
  assert.deepEqual(clips[0], {
    ...PROOF_PHASES[0],
    startSec: 0,
    endSec: 4.35,
    durationSec: 4.35,
  });
  assert.equal(clips[2].startSec, 13.75);
  assert.equal(clips[4].endSec, 42);
});

test('requires exactly one ordered marker for every proof phase', () => {
  assert.throws(() => validateProofMarkers(markers.slice(0, 4)), /exactly 5/);
  const wrong = structuredClone(markers);
  wrong[2].name = 'second_human_edit';
  assert.throws(() => validateProofMarkers(wrong), /single_human_edit_complete/);
});

test('rejects non-monotonic markers and truncated masters', () => {
  const nonMonotonic = structuredClone(markers);
  nonMonotonic[3].timeSec = nonMonotonic[2].timeSec;
  assert.throws(() => validateProofMarkers(nonMonotonic), /strictly increasing/);
  assert.throws(() => buildProofClipPlan(markers, 40), /ends before/);
});
