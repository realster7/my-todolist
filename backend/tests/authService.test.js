const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');

const authService = require('../src/services/authService');
const pool = require('../src/db/pool');
const { AppError } = require('../src/utils/errors');

const EMAIL = 'be03-svc-1@example.com';
const PASSWORD = 'password123';

let createdId;

test.after(async () => {
  await pool.query(
    "DELETE FROM users WHERE email LIKE 'be03-svc-%@example.com' OR email LIKE 'be04-svc-%@example.com'",
  );
  await pool.end();
});

test('signup returns created user without password field', async () => {
  const result = await authService.signup(EMAIL, PASSWORD, '서비스테스트');
  createdId = result.id;

  assert.ok(result.id);
  assert.strictEqual(result.email, EMAIL);
  assert.strictEqual(result.name, '서비스테스트');
  assert.ok(result.createdAt);
  assert.ok(result.updatedAt);
  assert.strictEqual(result.password, undefined);
});

test('signup stores a hashed password, not plaintext', async () => {
  const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [createdId]);
  const stored = rows[0].password;

  assert.notStrictEqual(stored, PASSWORD);
  assert.strictEqual(bcrypt.compareSync(PASSWORD, stored), true);
});

test('signup with duplicate email throws AppError 409', async () => {
  await assert.rejects(
    () => authService.signup(EMAIL, PASSWORD, '중복테스트'),
    (err) => {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 409);
      return true;
    },
  );
});

test('signup creates a default "기본" category for the new user', async () => {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 AND name = $2',
    [createdId, '기본'],
  );

  assert.strictEqual(rows.length, 1);
});

test('login with correct credentials returns user (no password), accessToken, refreshToken', async () => {
  const LOGIN_EMAIL = 'be04-svc-1@example.com';
  const LOGIN_PASSWORD = 'password123';
  await authService.signup(LOGIN_EMAIL, LOGIN_PASSWORD, '로그인테스트');

  const result = await authService.login(LOGIN_EMAIL, LOGIN_PASSWORD);

  assert.ok(result.user);
  assert.strictEqual(result.user.email, LOGIN_EMAIL);
  assert.strictEqual(result.user.password, undefined);
  assert.strictEqual(typeof result.accessToken, 'string');
  assert.strictEqual(typeof result.refreshToken, 'string');
});

test('login access token is a valid JWT encoding the user id', async () => {
  const LOGIN_EMAIL = 'be04-svc-1@example.com';
  const LOGIN_PASSWORD = 'password123';
  const { user, accessToken } = await authService.login(LOGIN_EMAIL, LOGIN_PASSWORD);

  const jwt = require('jsonwebtoken');
  const { jwtAccessSecret } = require('../src/config/env');
  const payload = jwt.verify(accessToken, jwtAccessSecret);

  assert.strictEqual(payload.userId, user.id);
});

test('login with non-existent email throws AppError 401', async () => {
  await assert.rejects(
    () => authService.login('be04-svc-nonexistent@example.com', 'password123'),
    (err) => {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 401);
      return true;
    },
  );
});

test('login with wrong password throws AppError 401', async () => {
  await assert.rejects(
    () => authService.login('be04-svc-1@example.com', 'wrong-password'),
    (err) => {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 401);
      return true;
    },
  );
});
