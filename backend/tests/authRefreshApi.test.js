const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const env = require('../src/config/env');

const EMAIL = 'be05-refresh-1@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userId;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  const user = await authService.signup(EMAIL, PASSWORD, '리프레시테스트');
  userId = user.id;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be05-refresh-%@example.com'");
});

test('POST /auth/refresh with valid refresh_token cookie returns 200 with accessToken', async () => {
  const refreshToken = jwtUtil.signRefreshToken(userId);

  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(typeof body.accessToken, 'string');
  assert.strictEqual(jwtUtil.verifyAccessToken(body.accessToken).userId, userId);
});

test('POST /auth/refresh without refresh_token cookie returns 401', async () => {
  const res = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST' });

  assert.strictEqual(res.status, 401);
});

test('POST /auth/refresh with expired refresh_token returns 401', async () => {
  const expiredToken = jwt.sign({ userId }, env.jwtRefreshSecret, { expiresIn: -1 });

  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${expiredToken}` },
  });

  assert.strictEqual(res.status, 401);
});

test('POST /auth/refresh with invalid signature refresh_token returns 401', async () => {
  const invalidToken = jwt.sign({ userId }, 'wrong-secret');

  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${invalidToken}` },
  });

  assert.strictEqual(res.status, 401);
});
