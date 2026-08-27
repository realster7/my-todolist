const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const { notFoundHandler, errorHandler } = require('../src/middlewares/errorHandler');
const { AppError } = require('../src/utils/errors');

function createRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.headersSent = false;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

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
});

test('GET on unknown route returns 404 with standard error format', async () => {
  const res = await fetch(`${baseUrl}/nonexistent-route`);
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'NOT_FOUND');
  assert.ok(body.error.message);
});

test('POST on unknown route also returns 404', async () => {
  const res = await fetch(`${baseUrl}/nonexistent-route`, { method: 'POST' });
  assert.strictEqual(res.status, 404);
});

test('malformed JSON body returns 400 with standard error format', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json',
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('notFoundHandler responds 404 directly when called', () => {
  const res = createRes();
  notFoundHandler({}, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.error.code, 'NOT_FOUND');
});

test('errorHandler responds with AppError statusCode/code/message', () => {
  const res = createRes();
  const err = new AppError(409, 'DUPLICATE_EMAIL', '이미 가입된 이메일입니다.');
  errorHandler(err, {}, res, () => {});
  assert.strictEqual(res.statusCode, 409);
  assert.deepStrictEqual(res.body, {
    error: { code: 'DUPLICATE_EMAIL', message: '이미 가입된 이메일입니다.' },
  });
});

test('errorHandler falls back to 500 for unexpected errors', () => {
  const res = createRes();
  errorHandler(new Error('boom'), {}, res, () => {});
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.body.error.code, 'INTERNAL_ERROR');
});

test('errorHandler delegates to next when headers already sent', () => {
  const res = createRes();
  res.headersSent = true;
  let forwardedErr;
  errorHandler(new Error('already sent'), {}, res, (err) => { forwardedErr = err; });
  assert.strictEqual(res.statusCode, null);
  assert.ok(forwardedErr instanceof Error);
});
