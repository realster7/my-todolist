const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');

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

function loginAttempt() {
  return fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'be-ratelimit@example.com', password: 'wrong-password' }),
  });
}

test('POST /auth/login은 15분에 10회까지만 허용하고 11번째부터 429를 반환한다', async () => {
  for (let i = 0; i < 10; i += 1) {
    const res = await loginAttempt();
    assert.notStrictEqual(res.status, 429, `${i + 1}번째 요청은 429가 아니어야 함`);
  }

  const res = await loginAttempt();
  assert.strictEqual(res.status, 429);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'TOO_MANY_REQUESTS');
});
