const test = require('node:test');
const assert = require('node:assert');

const jwtUtil = require('../src/utils/jwt');

test('signAccessToken/verifyAccessToken round-trip carries userId', () => {
  const token = jwtUtil.signAccessToken('user-123');
  const payload = jwtUtil.verifyAccessToken(token);
  assert.strictEqual(payload.userId, 'user-123');
});

test('signRefreshToken/verifyRefreshToken round-trip carries userId', () => {
  const token = jwtUtil.signRefreshToken('user-456');
  const payload = jwtUtil.verifyRefreshToken(token);
  assert.strictEqual(payload.userId, 'user-456');
});

test('verifyAccessToken rejects a token signed with a different secret', () => {
  const jwt = require('jsonwebtoken');
  const bogusToken = jwt.sign({ userId: 'x' }, 'wrong-secret');
  assert.throws(() => jwtUtil.verifyAccessToken(bogusToken));
});
