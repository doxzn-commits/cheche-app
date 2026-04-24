import assert from 'node:assert/strict';
import test from 'node:test';

import { calcDday } from './dday';

test('returns D+N for past dates', () => {
  assert.equal(calcDday('2026-04-20', '2026-04-24'), 'D+4');
});

test('returns D-DAY for today', () => {
  assert.equal(calcDday('2026-04-24', '2026-04-24'), 'D-DAY');
});

test('returns D-N for future dates', () => {
  assert.equal(calcDday('2026-04-28', '2026-04-24'), 'D-4');
});
