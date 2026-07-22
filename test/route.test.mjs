// Zero-dependency test using node:test (built in since Node 18). Run with
// `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { route, LEVELS, TIERS, CONTROLS } from '../lib/route.mjs';

test('rejects an invalid level', () => {
  assert.throws(() => route({ sensitivity: 'extreme', complexity: 'low' }), RangeError);
  assert.throws(() => route({ sensitivity: 'low', complexity: '' }), RangeError);
});

test('case-insensitive input', () => {
  const r = route({ sensitivity: 'HIGH', complexity: 'Low' });
  assert.equal(r.sensitivity, 'high');
  assert.equal(r.complexity, 'low');
});

// The full 3x3 grid, hand-derived from the stated policy (sensitivity caps
// the tier; controls key off the higher of sensitivity and whether the
// ACTUAL recommended tier reached mid-or-above), not from route.mjs's own
// code. Checks BOTH tier and controls for every combination - a prior
// version of this test only asserted `tierIndex <= complexityIndex`, which
// is true by construction of Math.min() regardless of whether the controls
// logic is broken, and hid exactly that bug (verified: simulating the
// original, pre-fix bug where sensitivity was never applied at all still
// passed that assertion on all 9 combinations).
const CASES = [
  // [sensitivity, complexity, expectedTierIndex, expectedControlsIndex]
  ['low', 'low', 0, 0],
  ['low', 'medium', 1, 1],
  ['low', 'high', 2, 1],
  ['medium', 'low', 0, 1],
  ['medium', 'medium', 1, 1],
  ['medium', 'high', 1, 1],
  ['high', 'low', 0, 2],
  ['high', 'medium', 0, 2],
  ['high', 'high', 0, 2],
];

for (const [sensitivity, complexity, expectedTierIdx, expectedControlsIdx] of CASES) {
  test(`(${sensitivity}, ${complexity}) -> tier ${expectedTierIdx}, controls ${expectedControlsIdx}`, () => {
    const r = route({ sensitivity, complexity });
    assert.equal(r.tierIndex, expectedTierIdx, `tier index for (${sensitivity}, ${complexity})`);
    assert.equal(r.tier, TIERS[expectedTierIdx].tier);
    assert.deepEqual(
      r.controls,
      CONTROLS[expectedControlsIdx],
      `controls for (${sensitivity}, ${complexity}) should match the tier actually recommended, not just the input axes independently`,
    );
  });
}

test('sensitivityCappedTier is true only when sensitivity actually reduced the tier below what complexity alone justifies', () => {
  assert.equal(route({ sensitivity: 'low', complexity: 'high' }).sensitivityCappedTier, false);
  assert.equal(route({ sensitivity: 'high', complexity: 'high' }).sensitivityCappedTier, true);
  assert.equal(route({ sensitivity: 'medium', complexity: 'high' }).sensitivityCappedTier, true);
  assert.equal(route({ sensitivity: 'high', complexity: 'low' }).sensitivityCappedTier, false); // already 0, nothing to cap
});

test('every LEVELS x LEVELS combination is covered by the table above', () => {
  const covered = new Set(CASES.map(([s, c]) => `${s}:${c}`));
  for (const s of LEVELS) {
    for (const c of LEVELS) {
      assert.ok(covered.has(`${s}:${c}`), `missing case for (${s}, ${c})`);
    }
  }
});

// The 9-case table above uses CONTROLS/TIERS from route.mjs as its own
// oracle, so a content regression there (e.g. "Cost cap" quietly dropped
// from CONTROLS[1]) would pass every case above unnoticed - the table only
// checks that the right INDEX was selected, not that the index still holds
// the right CONTENT. These two assertions are independent of route.mjs's
// own exported constants, spelled out by hand, specifically to catch that.
test('CONTROLS[1] content has not silently regressed (independent of route.mjs\'s own exports)', () => {
  assert.deepEqual(CONTROLS[1], [
    'Trace retention',
    'Eval gate before expansion',
    'Cost cap',
    'Mandatory human review',
  ]);
});

test('CONTROLS[2] content has not silently regressed (independent of route.mjs\'s own exports)', () => {
  assert.deepEqual(CONTROLS[2], [
    'Prefer local or approved-only models',
    'Data classification and PII controls',
    'Retention rules',
    'Legal and data review',
  ]);
});

test('route() returns a copy of the controls array, not the shared frozen reference', () => {
  const r1 = route({ sensitivity: 'low', complexity: 'low' });
  r1.controls.push('a caller mutated this');
  const r2 = route({ sensitivity: 'low', complexity: 'low' });
  assert.deepEqual(r2.controls, CONTROLS[0], 'a prior call\'s caller mutating its own copy must not affect later calls');
});

test('TIERS and CONTROLS are frozen against direct mutation of the exported constants', () => {
  // ES modules are strict mode by default, so assigning to a frozen
  // property throws TypeError rather than silently no-op-ing.
  assert.throws(() => {
    TIERS[0].tier = 'tampered';
  }, TypeError);
  assert.throws(() => {
    CONTROLS[0].push('tampered');
  }, TypeError);
});
