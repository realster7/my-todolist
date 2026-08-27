const test = require('node:test');
const assert = require('node:assert');

const { computeTodoStatus } = require('../src/utils/computeTodoStatus');

const TODAY = new Date('2026-09-15');

test('isDone true with past endDate returns DONE (완료 우선)', () => {
  const status = computeTodoStatus(
    { isDone: true, startDate: '2026-08-01', endDate: '2026-09-01' },
    TODAY
  );
  assert.strictEqual(status, 'DONE');
});

test('isDone false with endDate yesterday returns OVERDUE', () => {
  const status = computeTodoStatus(
    { isDone: false, startDate: '2026-09-01', endDate: '2026-09-14' },
    TODAY
  );
  assert.strictEqual(status, 'OVERDUE');
});

test('isDone false with endDate today returns IN_PROGRESS (경계값)', () => {
  const status = computeTodoStatus(
    { isDone: false, startDate: '2026-09-01', endDate: '2026-09-15' },
    TODAY
  );
  assert.strictEqual(status, 'IN_PROGRESS');
});

test('isDone false with startDate today returns IN_PROGRESS (경계값)', () => {
  const status = computeTodoStatus(
    { isDone: false, startDate: '2026-09-15', endDate: '2026-09-20' },
    TODAY
  );
  assert.strictEqual(status, 'IN_PROGRESS');
});

test('isDone false with startDate past and endDate future returns IN_PROGRESS', () => {
  const status = computeTodoStatus(
    { isDone: false, startDate: '2026-09-01', endDate: '2026-09-30' },
    TODAY
  );
  assert.strictEqual(status, 'IN_PROGRESS');
});

test('isDone false with startDate tomorrow returns NOT_STARTED', () => {
  const status = computeTodoStatus(
    { isDone: false, startDate: '2026-09-16', endDate: '2026-09-20' },
    TODAY
  );
  assert.strictEqual(status, 'NOT_STARTED');
});

test('isDone true with both dates in future returns DONE (비정상 조합도 완료 우선)', () => {
  const status = computeTodoStatus(
    { isDone: true, startDate: '2026-10-01', endDate: '2026-10-10' },
    TODAY
  );
  assert.strictEqual(status, 'DONE');
});
