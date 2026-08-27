const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const categoryQueries = require('../src/db/queries/categoryQueries');

const EMAIL_A = 'be06-api-a@example.com';
const EMAIL_B = 'be06-api-b@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  userA = await authService.signup(EMAIL_A, PASSWORD, '카테고리A');
  await categoryQueries.createCategory(pool, { userId: userA.id, name: '업무' });

  userB = await authService.signup(EMAIL_B, PASSWORD, '카테고리B');

  tokenA = jwtUtil.signAccessToken(userA.id);
  tokenB = jwtUtil.signAccessToken(userB.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be06-api-%@example.com'");
});

test('GET /categories with user A token returns 200 with default + custom categories', async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.strictEqual(body.length, 2);

  for (const category of body) {
    assert.ok(category.id);
    assert.strictEqual(category.userId, userA.id);
    assert.ok(category.name);
    assert.ok(category.createdAt);
  }

  const names = body.map((c) => c.name);
  assert.ok(names.includes('기본'));
  assert.ok(names.includes('업무'));
});

test('GET /categories with user B token returns only own default category (BR-02 ownership)', async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].userId, userB.id);
  assert.strictEqual(body[0].name, '기본');

  const names = body.map((c) => c.name);
  assert.ok(!names.includes('업무'));
});

test('GET /categories without Authorization header returns 401', async () => {
  const res = await fetch(`${baseUrl}/categories`);

  assert.strictEqual(res.status, 401);
});

test('GET /categories with invalid token returns 401', async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: 'Bearer garbage-token' },
  });

  assert.strictEqual(res.status, 401);
});
