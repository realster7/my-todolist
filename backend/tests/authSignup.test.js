const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');

const EMAIL = 'be03-api-1@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be03-api-%@example.com'");
});

test('POST /auth/signup returns 201 with created user, no password field', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'API테스트' }),
  });

  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.ok(body.id);
  assert.strictEqual(body.email, EMAIL);
  assert.strictEqual(body.name, 'API테스트');
  assert.strictEqual(body.password, undefined);
});

test('POST /auth/signup with duplicate email returns 409', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'API테스트' }),
  });

  assert.strictEqual(res.status, 409);
  const body = await res.json();
  assert.ok(body.error);
  assert.ok(body.error.code);
  assert.ok(body.error.message);
});

test('POST /auth/signup without password returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'be03-api-2@example.com', name: 'API테스트2' }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /auth/signup with invalid email format returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: PASSWORD, name: 'API테스트3' }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /auth/signup without name returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'be03-api-4@example.com', password: PASSWORD }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /auth/signup with a DB-level failure (non-duplicate) returns 500', async () => {
  // name이 VARCHAR(100)을 초과하면 unique violation(23505)이 아닌 다른 pg 에러가 발생해
  // authService/controller의 "예상 못한 에러" 분기(rollback, 500 응답)를 탄다.
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'be03-api-5@example.com',
      password: PASSWORD,
      name: 'x'.repeat(101),
    }),
  });

  assert.strictEqual(res.status, 500);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'INTERNAL_ERROR');
});
