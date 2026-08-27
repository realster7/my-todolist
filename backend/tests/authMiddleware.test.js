const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../src/middlewares/authMiddleware');
const jwtUtil = require('../src/utils/jwt');
const env = require('../src/config/env');

function createRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

test('authMiddleware without Authorization header returns 401 and does not call next', () => {
  const req = { headers: {} };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('authMiddleware with non-Bearer header returns 401', () => {
  const req = { headers: { authorization: 'Token abc' } };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('authMiddleware with invalid JWT string returns 401', () => {
  const req = { headers: { authorization: 'Bearer garbage-not-a-jwt' } };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('authMiddleware with expired access token returns 401', () => {
  const expiredToken = jwt.sign({ userId: 'x' }, env.jwtAccessSecret, { expiresIn: -1 });
  const req = { headers: { authorization: `Bearer ${expiredToken}` } };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('authMiddleware with valid access token calls next and sets req.user', () => {
  const token = jwtUtil.signAccessToken('user-abc');
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.deepStrictEqual(req.user, { id: 'user-abc' });
  assert.strictEqual(res.statusCode, null);
});
