const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');

const EMAIL_A = 'be13-api-a@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let tokenA;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  userA = await authService.signup(EMAIL_A, PASSWORD, '수정전이름');
  tokenA = jwtUtil.signAccessToken(userA.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be13-api-%@example.com'");
});

async function patchMe(body, token = tokenA) {
  return fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

test('PATCH /users/me updates only name, email stays the same', async () => {
  const res = await patchMe({ name: '변경된이름' });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.name, '변경된이름');
  assert.strictEqual(body.email, EMAIL_A);
  assert.strictEqual(body.password, undefined);
});

test('PATCH /users/me with new password allows login with it afterwards', async () => {
  const res = await patchMe({ password: 'newpassword123' });
  assert.strictEqual(res.status, 200);

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL_A, password: 'newpassword123' }),
  });
  assert.strictEqual(loginRes.status, 200);
});

test('PATCH /users/me without name or password returns 400', async () => {
  const res = await patchMe({});
  assert.strictEqual(res.status, 400);
});

test('PATCH /users/me with blank name returns 400', async () => {
  const res = await patchMe({ name: '   ' });
  assert.strictEqual(res.status, 400);
});

test('PATCH /users/me with short password returns 400', async () => {
  const res = await patchMe({ password: '1234567' });
  assert.strictEqual(res.status, 400);
});

test('PATCH /users/me without Authorization header returns 401', async () => {
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '시도' }),
  });
  assert.strictEqual(res.status, 401);
});
