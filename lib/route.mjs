// The routing decision itself, extracted from The Agentic Tekton's
// src/components/RoutingWidget.astro and fixed along the way: that widget's
// own code comment claims "high sensitivity can pull it [the tier] back
// toward local," but the shipped code (`let t = state.complexity`) never
// actually applies sensitivity to the tier, only to which controls are
// shown. This module implements the documented intent for real.

export const LEVELS = ['low', 'medium', 'high'];

// Frozen (each entry and the top-level array) so a consumer mutating a
// returned reference - or the exported constant directly - can't silently
// corrupt what every later call to route() recommends. Object.freeze is
// shallow, hence freezing each entry individually.
export const TIERS = Object.freeze(
  [
    {
      tier: 'Local SLM or low-cost hosted model',
      why: 'Retrieval, classification, summarisation, templating, and narrow transforms do not need a frontier model.',
    },
    {
      tier: 'Mid-tier hosted model, with cache and an eval gate',
      why: 'Worth a stronger model, but cache results and gate on evaluations to keep cost and quality honest.',
    },
    {
      tier: 'Frontier model',
      why: 'Ambiguous cross-file reasoning and architecture-sensitive changes justify the cost; one good completion saves real review time.',
    },
  ].map(Object.freeze),
);

export const CONTROLS = Object.freeze(
  [
    ['Approved-model list', 'Telemetry'],
    ['Trace retention', 'Eval gate before expansion', 'Cost cap', 'Mandatory human review'],
    ['Prefer local or approved-only models', 'Data classification and PII controls', 'Retention rules', 'Legal and data review'],
  ].map(Object.freeze),
);

function levelIndex(value, flagName) {
  const idx = LEVELS.indexOf(String(value).toLowerCase());
  if (idx === -1) {
    throw new RangeError(`--${flagName} must be one of: ${LEVELS.join(', ')} (got "${value}")`);
  }
  return idx;
}

// Sensitivity caps how high the tier can go, regardless of complexity:
// low sensitivity caps at 2 (no restriction), medium caps at 1 (mid-tier at
// most), high caps at 0 (local only). The final tier is the lower of what
// complexity alone would justify and what sensitivity allows.
const SENSITIVITY_TIER_CAP = [2, 1, 0];

export function route({ sensitivity, complexity }) {
  const sensitivityIdx = levelIndex(sensitivity, 'sensitivity');
  const complexityIdx = levelIndex(complexity, 'complexity');

  const tierIdx = Math.min(complexityIdx, SENSITIVITY_TIER_CAP[sensitivityIdx]);
  const recommendation = TIERS[tierIdx];

  // Controls key off the higher of sensitivity and the ACTUAL tier reached
  // (capped at 1, since level 2 is specifically about data sensitivity/legal
  // review and shouldn't fire just because a low-sensitivity task happened
  // to justify the frontier tier on complexity alone). Using tierIdx here,
  // not a separately-computed complexity threshold, is what closes a real
  // bug found while building this: the original threshold (complexity >= 2)
  // didn't match the threshold tierIdx actually uses to reach level 1
  // (complexity >= 1, once sensitivity allows it) - low sensitivity +
  // medium complexity recommended the mid-tier but printed only the local
  // tier's controls, silently missing the eval gate and human review the
  // recommended tier itself calls for.
  const controlsLevel = Math.max(sensitivityIdx, tierIdx >= 1 ? 1 : 0);
  const controls = sensitivityIdx === 2 ? CONTROLS[2] : CONTROLS[controlsLevel];

  return {
    sensitivity: LEVELS[sensitivityIdx],
    complexity: LEVELS[complexityIdx],
    tierIndex: tierIdx,
    tier: recommendation.tier,
    why: recommendation.why,
    // A copy, not the frozen array itself - freezing already stops in-place
    // mutation, but a caller could still reassign this element elsewhere
    // expecting an independent array; returning a copy keeps that safe too.
    controls: [...controls],
    sensitivityCappedTier: tierIdx < complexityIdx,
  };
}
