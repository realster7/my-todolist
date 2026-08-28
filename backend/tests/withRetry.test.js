const test = require('node:test');
const assert = require('node:assert');
const { withRetry } = require('../src/db/withRetry');

test('withRetry는 성공하면 바로 반환한다', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls += 1;
    return 'ok';
  });
  assert.strictEqual(result, 'ok');
  assert.strictEqual(calls, 1);
});

test('withRetry는 재시도 가능한 에러(ECONNREFUSED)면 재시도 후 성공한다', async () => {
  let calls = 0;
  const result = await withRetry(
    async () => {
      calls += 1;
      if (calls < 2) {
        const err = new Error('연결 실패');
        err.code = 'ECONNREFUSED';
        throw err;
      }
      return 'ok';
    },
    { attempts: 3, delayMs: 1 },
  );
  assert.strictEqual(result, 'ok');
  assert.strictEqual(calls, 2);
});

test('withRetry는 재시도 불가능한 에러(예: unique_violation)면 즉시 던지고 재시도하지 않는다', async () => {
  let calls = 0;
  await assert.rejects(() =>
    withRetry(
      async () => {
        calls += 1;
        const err = new Error('중복');
        err.code = '23505';
        throw err;
      },
      { attempts: 3, delayMs: 1 },
    ),
  );
  assert.strictEqual(calls, 1);
});

test('withRetry는 재시도 가능한 에러가 attempts만큼 반복되면 마지막 에러를 던진다', async () => {
  let calls = 0;
  await assert.rejects(() =>
    withRetry(
      async () => {
        calls += 1;
        const err = new Error('연결 실패');
        err.code = 'ETIMEDOUT';
        throw err;
      },
      { attempts: 3, delayMs: 1 },
    ),
  );
  assert.strictEqual(calls, 3);
});
