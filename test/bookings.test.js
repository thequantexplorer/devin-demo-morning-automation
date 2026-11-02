const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore, isWeekend } = require('../src/bookings');

// A Tuesday in the team's next sprint.
const SPRINT_DAY = '2026-09-15';

test('books a free desk', () => {
  const store = createStore();
  const booking = store.book({ person: 'ana', deskId: 'A1', date: SPRINT_DAY });
  assert.equal(booking.deskId, 'A1');
  assert.equal(store.list(SPRINT_DAY).length, 1);
});

test('a desk can only be booked once per day', () => {
  const store = createStore();
  store.book({ person: 'ana', deskId: 'A1', date: SPRINT_DAY });
  assert.throws(
    () => store.book({ person: 'ben', deskId: 'A1', date: SPRINT_DAY }),
    /already booked/,
  );
});

test('a person can only hold one desk per day', () => {
  const store = createStore();
  store.book({ person: 'ana', deskId: 'A1', date: SPRINT_DAY });
  assert.throws(
    () => store.book({ person: 'ana', deskId: 'B1', date: SPRINT_DAY }),
    /already has a desk/,
  );
});

test('rejects dates in the past', () => {
  const store = createStore();
  assert.throws(
    () => store.book({ person: 'ana', deskId: 'A1', date: '2020-01-06' }),
    /in the past/,
  );
});

test('rejects bad input', () => {
  const store = createStore();
  assert.throws(() => store.book({ person: '', deskId: 'A1', date: SPRINT_DAY }), /person is required/);
  assert.throws(() => store.book({ person: 'ana', deskId: 'A1', date: '15/09/2026' }), /YYYY-MM-DD/);
  assert.throws(() => store.book({ person: 'ana', deskId: 'Z9', date: SPRINT_DAY }), /unknown desk/);
});

test('knows weekends', () => {
  assert.equal(isWeekend('2026-09-12'), true);
  assert.equal(isWeekend('2026-09-15'), false);
});
