const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const categoryQueries = require('../src/db/queries/categoryQueries');

const EMAIL_A = 'be10-api-a@example.com';
const EMAIL_B = 'be10-api-b@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;
let defaultCategoryIdA;

async function createTestTodo(overrides = {}) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date, is_done)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      overrides.userId || userA.id,
      overrides.categoryId || defaultCategoryIdA,
      overrides.title || '삭제 테스트',
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

  userA = await authService.signup(EMAIL_A, PASSWORD, '삭제A');
  userB = await authService.signup(EMAIL_B, PASSWORD, '삭제B');

  const categoriesA = await categoryQueries.findCategoriesByUserId(pool, userA.id);
  defaultCategoryIdA = categoriesA.find((c) => c.name === '기본').id;

  tokenA = jwtUtil.signAccessToken(userA.id);
  tokenB = jwtUtil.signAccessToken(userB.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be10-api-%@example.com'");
});

async function deleteTodo(id, token = tokenA) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${baseUrl}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
}

test('DELETE /todos/:id deletes own todo and returns 204 with empty body', async () => {
  const id = await createTestTodo();
  const res = await deleteTodo(id);

  assert.strictEqual(res.status, 204);
  const bodyText = await res.text();
  assert.strictEqual(bodyText, '');
});

test('DELETE /todos/:id actually removes the row from the database', async () => {
  const id = await createTestTodo();
  await deleteTodo(id);

  const result = await pool.query('SELECT id FROM todos WHERE id=$1', [id]);
  assert.strictEqual(result.rows.length, 0);
});

test('DELETE /todos/:id on another user todo returns 404', async () => {
  const id = await createTestTodo();
  const res = await deleteTodo(id, tokenB);

  assert.strictEqual(res.status, 404);
});

test('DELETE /todos/:id with non-existent uuid returns 404', async () => {
  const res = await deleteTodo('00000000-0000-0000-0000-000000000000');

  assert.strictEqual(res.status, 404);
});

test('DELETE /todos/:id with malformed id returns 400', async () => {
  const res = await deleteTodo('not-a-uuid');

  assert.strictEqual(res.status, 400);
});

test('DELETE /todos/:id without Authorization header returns 401', async () => {
  const id = await createTestTodo();
  const res = await deleteTodo(id, null);

  assert.strictEqual(res.status, 401);
});
