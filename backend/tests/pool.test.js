const test = require('node:test');
const assert = require('node:assert');

const pool = require('../src/db/pool');
const config = require('../src/config/env');

test.after(async () => {
  await pool.end();
});

test('pool is configured with max 20 connections', () => {
  assert.strictEqual(pool.options.max, 20);
});

test('pool uses connectionString from config', () => {
  assert.strictEqual(pool.options.connectionString, config.databaseUrl);
});

test('pool can execute a query against the real database', async () => {
  const result = await pool.query('SELECT 1');
  assert.ok(result.rows[0]);
});
