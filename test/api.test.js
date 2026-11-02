const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

// Next weekday a week or more from now, so the date never ends up in the past.
function upcomingWeekday() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

const SPRINT_DAY = upcomingWeekday();

test('GET /health', async () => {
  const res = await request(createApp()).get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});

test('POST /api/bookings then GET /api/desks shows one fewer free desk', async () => {
  const app = createApp();
  const created = await request(app)
    .post('/api/bookings')
    .send({ person: 'ana', deskId: 'B2', date: SPRINT_DAY });
  assert.equal(created.status, 201);

  const free = await request(app).get(`/api/desks?date=${SPRINT_DAY}`);
  assert.equal(free.status, 200);
  assert.equal(free.body.length, 4);
  assert.ok(!free.body.some((d) => d.id === 'B2'));
});

test('POST /api/bookings on a Saturday is rejected', async () => {
  const res = await request(createApp())
    .post('/api/bookings')
    .send({ person: 'ana', deskId: 'A1', date: '2030-01-05' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /weekends/);
});

test('DELETE /api/bookings/:id of a missing booking is a 404', async () => {
  const res = await request(createApp()).delete('/api/bookings/999');
  assert.equal(res.status, 404);
});
