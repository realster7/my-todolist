const test = require('node:test');
const assert = require('node:assert');

const app = require('../src/app.js');
const pool = require('../src/db/pool');
const authService = require('../src/services/authService');
const jwtUtil = require('../src/utils/jwt');
const categoryQueries = require('../src/db/queries/categoryQueries');

const EMAIL_A = 'be08-api-a@example.com';
const EMAIL_B = 'be08-api-b@example.com';
const PASSWORD = 'password123';

let server;
let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;
let workCategoryIdA;

let todoNotStartedId;
let todoInProgressId;
let todoDoneId;
let todoOverdueId;

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function insertTodo(client, { userId, categoryId, title, startDate, endDate, isDone }) {
  const result = await client.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date, is_done)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [userId, categoryId, title, startDate, endDate, isDone]
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

  const today = new Date();

  userA = await authService.signup(EMAIL_A, PASSWORD, '목록A');
  userB = await authService.signup(EMAIL_B, PASSWORD, '목록B');

  const workCategory = await categoryQueries.createCategory(pool, { userId: userA.id, name: '여행' });
  workCategoryIdA = workCategory.id;

  const categoriesA = await categoryQueries.findCategoriesByUserId(pool, userA.id);
  const defaultCategoryIdA = categoriesA.find((c) => c.name === '기본').id;

  const categoriesB = await categoryQueries.findCategoriesByUserId(pool, userB.id);
  const defaultCategoryIdB = categoriesB.find((c) => c.name === '기본').id;

  await insertTodo(pool, {
    userId: userB.id,
    categoryId: defaultCategoryIdB,
    title: 'B의 할일',
    startDate: addDays(today, -1),
    endDate: addDays(today, 1),
    isDone: false,
  });

  todoNotStartedId = await insertTodo(pool, {
    userId: userA.id,
    categoryId: defaultCategoryIdA,
    title: '시작전',
    startDate: addDays(today, 5),
    endDate: addDays(today, 10),
    isDone: false,
  });

  todoInProgressId = await insertTodo(pool, {
    userId: userA.id,
    categoryId: workCategoryIdA,
    title: '진행중',
    startDate: addDays(today, -2),
    endDate: addDays(today, 2),
    isDone: false,
  });

  todoDoneId = await insertTodo(pool, {
    userId: userA.id,
    categoryId: defaultCategoryIdA,
    title: '완료(지연아님)',
    startDate: addDays(today, -10),
    endDate: addDays(today, -5),
    isDone: true,
  });

  todoOverdueId = await insertTodo(pool, {
    userId: userA.id,
    categoryId: defaultCategoryIdA,
    title: '지연',
    startDate: addDays(today, -10),
    endDate: addDays(today, -3),
    isDone: false,
  });

  tokenA = jwtUtil.signAccessToken(userA.id);
  tokenB = jwtUtil.signAccessToken(userB.id);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.query("DELETE FROM users WHERE email LIKE 'be08-api-%@example.com'");
});

test('GET /todos without filter returns all own todos with status field', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 4);
  for (const todo of body) {
    assert.ok(todo.status);
    assert.notStrictEqual(todo.userId, userB.id);
  }
});

test('GET /todos?category filters by category', async () => {
  const res = await fetch(`${baseUrl}/todos?category=${workCategoryIdA}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].id, todoInProgressId);
});

test('GET /todos?status=NOT_STARTED returns only not-started todo', async () => {
  const res = await fetch(`${baseUrl}/todos?status=NOT_STARTED`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].id, todoNotStartedId);
});

test('GET /todos?status=IN_PROGRESS returns only in-progress todo', async () => {
  const res = await fetch(`${baseUrl}/todos?status=IN_PROGRESS`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].id, todoInProgressId);
});

test('GET /todos?status=DONE returns only done todo even though endDate has passed', async () => {
  const res = await fetch(`${baseUrl}/todos?status=DONE`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].id, todoDoneId);
});

test('GET /todos?status=OVERDUE returns only overdue todo, not the completed one', async () => {
  const res = await fetch(`${baseUrl}/todos?status=OVERDUE`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].id, todoOverdueId);
});

test('GET /todos without Authorization header returns 401', async () => {
  const res = await fetch(`${baseUrl}/todos`);
  assert.strictEqual(res.status, 401);
});

test('GET /todos?status=INVALID returns 400', async () => {
  const res = await fetch(`${baseUrl}/todos?status=INVALID`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(res.status, 400);
});

test('GET /todos with tokenB only returns userB own todos (BR-02)', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.length, 1);
  for (const todo of body) {
    assert.strictEqual(todo.userId, userB.id);
  }
});
