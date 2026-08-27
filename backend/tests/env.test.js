const test = require('node:test');
const assert = require('node:assert');

const ENV_PATH = require.resolve('../src/config/env.js');

const REQUIRED_KEYS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
];

const VALID_ENV = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/todolist',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
};

let originalEnv;

test.beforeEach(() => {
  originalEnv = { ...process.env };
  delete require.cache[ENV_PATH];
});

test.afterEach(() => {
  process.env = originalEnv;
  delete require.cache[ENV_PATH];
});

test('throws when a required env var is missing', () => {
  for (const missingKey of REQUIRED_KEYS) {
    Object.assign(process.env, VALID_ENV);
    process.env[missingKey] = '';
    delete process.env.PORT;

    delete require.cache[ENV_PATH];
    assert.throws(
      () => require(ENV_PATH),
      new RegExp(`Missing required environment variable: ${missingKey}`),
      `expected throw when ${missingKey} is missing`
    );
  }
});

test('returns config object when all required env vars are set', () => {
  Object.assign(process.env, VALID_ENV);
  delete process.env.PORT;

  const config = require(ENV_PATH);

  assert.strictEqual(config.databaseUrl, VALID_ENV.DATABASE_URL);
  assert.strictEqual(config.jwtAccessSecret, VALID_ENV.JWT_ACCESS_SECRET);
  assert.strictEqual(config.jwtRefreshSecret, VALID_ENV.JWT_REFRESH_SECRET);
  assert.strictEqual(config.jwtAccessExpiresIn, VALID_ENV.JWT_ACCESS_EXPIRES_IN);
  assert.strictEqual(config.jwtRefreshExpiresIn, VALID_ENV.JWT_REFRESH_EXPIRES_IN);
});

test('port defaults to 3000 when PORT is not set', () => {
  Object.assign(process.env, VALID_ENV);
  delete process.env.PORT;

  const config = require(ENV_PATH);

  assert.strictEqual(config.port, 3000);
});

test('port follows PORT env var when set', () => {
  Object.assign(process.env, VALID_ENV);
  process.env.PORT = '4321';

  const config = require(ENV_PATH);

  assert.strictEqual(config.port, 4321);
});
