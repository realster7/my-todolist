const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const categoryQueries = require('../src/db/queries/categoryQueries');

const EMAIL_A = 'be07-api-a@example.com';
const EMAIL_B = 'be07-api-b@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;
let defaultCategoryIdA;
let workCategoryIdA;
let defaultCategoryIdB;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  userA = await authService.signup(EMAIL_A, PASSWORD, '할일A');
  userB = await authService.signup(EMAIL_B, PASSWORD, '할일B');

  const workCategory = await categoryQueries.createCategory(pool, { userId: userA.id, name: '여행' });
  workCategoryIdA = workCategory.id;

  const categoriesA = await categoryQueries.findCategoriesByUserId(pool, userA.id);
  defaultCategoryIdA = categoriesA.find((c) => c.name === '기본').id;

  const categoriesB = await categoryQueries.findCategoriesByUserId(pool, userB.id);
  defaultCategoryIdB = categoriesB.find((c) => c.name === '기본').id;

  tokenA = jwtUtil.signAccessToken(userA.id);
  tokenB = jwtUtil.signAccessToken(userB.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be07-api-%@example.com'");
});

test('POST /todos without categoryId creates todo with default category', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
    }),
  });

  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.categoryId, defaultCategoryIdA);
  assert.strictEqual(body.isDone, false);
  assert.strictEqual(body.completedAt, null);
  assert.strictEqual(body.startDate, '2026-09-01');
  assert.strictEqual(body.endDate, '2026-09-07');
});

test('POST /todos with categoryId creates todo with given category', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      categoryId: workCategoryIdA,
    }),
  });

  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.categoryId, workCategoryIdA);
});

test('POST /todos with endDate before startDate returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'x',
      startDate: '2026-09-10',
      endDate: '2026-09-01',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos without Authorization header returns 401', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
    }),
  });

  assert.strictEqual(res.status, 401);
});

test('POST /todos with categoryId owned by another user returns 400 (BR-02 ownership)', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      categoryId: defaultCategoryIdB,
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos without title returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      startDate: '2026-09-01',
      endDate: '2026-09-07',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos without startDate returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      endDate: '2026-09-07',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos with invalid startDate format returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: 'not-a-date',
      endDate: '2026-09-07',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos without endDate returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /todos with invalid endDate format returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: '알고리즘 과제',
      startDate: '2026-09-01',
      endDate: 'not-a-date',
    }),
  });

  assert.strictEqual(res.status, 400);
});
