const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const categoryQueries = require('../src/db/queries/categoryQueries');

const EMAIL_A = 'be09-api-a@example.com';
const EMAIL_B = 'be09-api-b@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;
let defaultCategoryIdA;
let personalCategoryIdA;
let defaultCategoryIdB;

async function createTestTodo(overrides = {}) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date, is_done)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      overrides.userId || userA.id,
      overrides.categoryId || defaultCategoryIdA,
      overrides.title || '테스트 할일',
      overrides.startDate || '2026-09-01',
      overrides.endDate || '2026-09-10',
      overrides.isDone || false,
    ]
  );
  return result.rows[0].id;
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  userA = await authService.signup(EMAIL_A, PASSWORD, '수정A');
  userB = await authService.signup(EMAIL_B, PASSWORD, '수정B');

  const personalCategory = await categoryQueries.createCategory(pool, { userId: userA.id, name: '개인' });
  personalCategoryIdA = personalCategory.id;

  const categoriesA = await categoryQueries.findCategoriesByUserId(pool, userA.id);
  defaultCategoryIdA = categoriesA.find((c) => c.name === '기본').id;

  const categoriesB = await categoryQueries.findCategoriesByUserId(pool, userB.id);
  defaultCategoryIdB = categoriesB.find((c) => c.name === '기본').id;

  tokenA = jwtUtil.signAccessToken(userA.id);
  tokenB = jwtUtil.signAccessToken(userB.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be09-api-%@example.com'");
});

async function patchTodo(id, body, token = tokenA) {
  return fetch(`${baseUrl}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

test('PATCH /todos/:id updates only title, leaves dates unchanged', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { title: '변경된 제목' });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.title, '변경된 제목');
  assert.strictEqual(body.startDate, '2026-09-01');
  assert.strictEqual(body.endDate, '2026-09-10');
});

test('PATCH /todos/:id with startDate after existing endDate returns 400', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { startDate: '2026-09-15' });

  assert.strictEqual(res.status, 400);
});

test('PATCH /todos/:id with endDate before existing startDate returns 400', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { endDate: '2026-08-01' });

  assert.strictEqual(res.status, 400);
});

test('PATCH /todos/:id with both startDate and endDate updates both', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { startDate: '2026-10-01', endDate: '2026-10-10' });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.startDate, '2026-10-01');
  assert.strictEqual(body.endDate, '2026-10-10');
});

test('PATCH /todos/:id false to true sets completedAt to now', async () => {
  const id = await createTestTodo({ isDone: false });
  const res = await patchTodo(id, { isDone: true });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.notStrictEqual(body.completedAt, null);
  assert.ok(Math.abs(Date.now() - Date.parse(body.completedAt)) < 10000);
});

test('PATCH /todos/:id true to false resets completedAt to null', async () => {
  const id = await createTestTodo({ isDone: true });
  const res = await patchTodo(id, { isDone: false });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.completedAt, null);
});

test('PATCH /todos/:id resending same isDone value keeps completedAt unchanged', async () => {
  const id = await createTestTodo({ isDone: false });
  const res = await patchTodo(id, { isDone: false });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.completedAt, null);
});

test('PATCH /todos/:id without isDone leaves completedAt unchanged', async () => {
  const id = await createTestTodo({ isDone: false });
  const res = await patchTodo(id, { title: '제목만' });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.isDone, false);
  assert.strictEqual(body.completedAt, null);
});

test('PATCH /todos/:id with own categoryId updates category', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { categoryId: personalCategoryIdA });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.categoryId, personalCategoryIdA);
});

test('PATCH /todos/:id with categoryId owned by another user returns 400 (BR-02)', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { categoryId: defaultCategoryIdB });

  assert.strictEqual(res.status, 400);
});

test('PATCH /todos/:id on another user todo returns 404', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { title: '시도' }, tokenB);

  assert.strictEqual(res.status, 404);
});

test('PATCH /todos/:id with non-existent uuid returns 404', async () => {
  const res = await patchTodo('00000000-0000-0000-0000-000000000000', { title: '시도' });

  assert.strictEqual(res.status, 404);
});

test('PATCH /todos/:id with malformed id returns 400', async () => {
  const res = await patchTodo('not-a-uuid', { title: '시도' });

  assert.strictEqual(res.status, 400);
});

test('PATCH /todos/:id without Authorization header returns 401', async () => {
  const id = await createTestTodo();
  const res = await fetch(`${baseUrl}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '시도' }),
  });

  assert.strictEqual(res.status, 401);
});

test('PATCH /todos/:id with explicit null description updates to null', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { description: null });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.description, null);
});

test('PATCH /todos/:id with empty body keeps original fields', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, {});

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.title, '테스트 할일');
  assert.strictEqual(body.startDate, '2026-09-01');
  assert.strictEqual(body.endDate, '2026-09-10');
});

test('PATCH /todos/:id with empty title returns 400', async () => {
  const id = await createTestTodo();
  const res = await patchTodo(id, { title: '' });

  assert.strictEqual(res.status, 400);
});
