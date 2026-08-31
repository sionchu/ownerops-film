export const PROOF_PHASES = Object.freeze([
  {
    marker: 'webmcp_connected_complete',
    clip: '01_webmcp_connected.mp4',
    instruction: 'WebMCP connection and current Site Tools are legible',
  },
  {
    marker: 'agent_plan_preview_complete',
    clip: '02_agent_plan_preview.mp4',
    instruction: 'Agent preview is materialized in OwnerOps',
  },
  {
    marker: 'single_human_edit_complete',
    clip: '03_human_edit.mp4',
    instruction: 'Exactly one direct candidate edit shows YOUR EDIT and Review required',
  },
  {
    marker: 'exact_review_complete',
    clip: '04_agent_review_exact_edit.mp4',
    instruction: 'The exact edited candidate remains and REVIEWED is held for 3–4 seconds',
  },
  {
    marker: 'apply_complete',
    clip: '05_apply_reviewed.mp4',
    instruction: 'Human Apply completes and committed state is visible',
  },
]);

const assertFiniteTime = (value, label) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number`);
  }
};

export const validateProofMarkers = (markers) => {
  if (!Array.isArray(markers) || markers.length !== PROOF_PHASES.length) {
    throw new Error(`Expected exactly ${PROOF_PHASES.length} proof markers`);
  }

  let previousTime = -1;
  markers.forEach((marker, index) => {
    const expected = PROOF_PHASES[index].marker;
    if (marker.name !== expected) {
      throw new Error(`Marker ${index + 1} must be ${expected}, got ${marker.name ?? 'missing'}`);
    }
    assertFiniteTime(marker.timeSec, marker.name);
    if (marker.timeSec <= previousTime) {
      throw new Error('Proof markers must be strictly increasing');
    }
    previousTime = marker.timeSec;
  });

  return markers;
};

export const buildProofClipPlan = (
  markers,
  masterDurationSec,
  {leadHandleSec = 0.25, tailHandleSec = 0.35} = {},
) => {
  validateProofMarkers(markers);
  assertFiniteTime(masterDurationSec, 'masterDurationSec');
  if (masterDurationSec < markers.at(-1).timeSec) {
    throw new Error('Master duration ends before the final proof marker');
  }

  return PROOF_PHASES.map((phase, index) => {
    const previousBoundary = index === 0 ? 0 : markers[index - 1].timeSec;
    const startSec = Math.max(0, previousBoundary - (index === 0 ? 0 : leadHandleSec));
    const endSec = index === PROOF_PHASES.length - 1
      ? masterDurationSec
      : Math.min(masterDurationSec, markers[index].timeSec + tailHandleSec);
    const durationSec = endSec - startSec;
    if (durationSec < 0.5) {
      throw new Error(`${phase.clip} would be shorter than 0.5 seconds`);
    }
    return {
      ...phase,
      startSec: Number(startSec.toFixed(3)),
      endSec: Number(endSec.toFixed(3)),
      durationSec: Number(durationSec.toFixed(3)),
    };
  });
};
