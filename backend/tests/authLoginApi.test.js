const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');

const EMAIL = 'be04-api-1@example.com';
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

  await authService.signup(EMAIL, PASSWORD, 'API로그인테스트');
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be04-api-%@example.com'");
});

test('POST /auth/login with correct credentials returns 200 with accessToken and user', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(typeof body.accessToken, 'string');
  assert.ok(body.user.id);
  assert.strictEqual(body.user.email, EMAIL);
  assert.strictEqual(body.user.password, undefined);
});

test('POST /auth/login sets an httpOnly refresh_token cookie', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const cookies = res.headers.getSetCookie();
  const refreshCookie = cookies.find((c) => c.startsWith('refresh_token='));
  assert.ok(refreshCookie);
  assert.ok(refreshCookie.includes('HttpOnly'));
});

test('POST /auth/login with non-existent email returns 401', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'be04-api-nonexistent@example.com', password: PASSWORD }),
  });

  assert.strictEqual(res.status, 401);
});

test('POST /auth/login with wrong password returns 401', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'wrong-password' }),
  });

  assert.strictEqual(res.status, 401);
});

test('POST /auth/login without password returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /auth/login without email returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });

  assert.strictEqual(res.status, 400);
});
