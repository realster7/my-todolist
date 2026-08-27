async function insertTodo(client, { userId, categoryId, title, description, startDate, endDate }) {
  const result = await client.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, category_id, title, description,
       TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
       is_done, completed_at, created_at, updated_at`,
    [userId, categoryId, title, description || null, startDate, endDate]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    isDone: row.is_done,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findTodosByUserId(client, userId, { categoryId } = {}) {
  const result = await client.query(
    `SELECT id, user_id, category_id, title, description,
       TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
       is_done, completed_at, created_at, updated_at
     FROM todos
     WHERE user_id = $1 AND ($2::uuid IS NULL OR category_id = $2)
     ORDER BY created_at ASC`,
    [userId, categoryId || null]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    isDone: row.is_done,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function findTodoById(client, todoId, userId) {
  const result = await client.query(
    `SELECT id, user_id, category_id, title, description,
       TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
       is_done, completed_at, created_at, updated_at
     FROM todos WHERE id = $1 AND user_id = $2`,
    [todoId, userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, categoryId: row.category_id,
    title: row.title, description: row.description,
    startDate: row.start_date, endDate: row.end_date,
    isDone: row.is_done, completedAt: row.completed_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function updateTodo(client, todoId, userId, {
  title, descriptionProvided, description, startDate, endDate, categoryId, isDone,
}) {
  const result = await client.query(
    `UPDATE todos
     SET
       title = COALESCE($3, title),
       description = CASE WHEN $4::boolean THEN $5 ELSE description END,
       start_date = COALESCE($6::date, start_date),
       end_date = COALESCE($7::date, end_date),
       category_id = COALESCE($8::uuid, category_id),
       completed_at = CASE
         WHEN $9::boolean IS NULL THEN completed_at
         WHEN $9 = true AND is_done = false THEN NOW()
         WHEN $9 = false AND is_done = true THEN NULL
         ELSE completed_at
       END,
       is_done = COALESCE($9::boolean, is_done),
       updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, category_id, title, description,
       TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
       is_done, completed_at, created_at, updated_at`,
    [
      todoId, userId,
      title ?? null,
      descriptionProvided || false, description ?? null,
      startDate ?? null, endDate ?? null, categoryId ?? null,
      typeof isDone === 'boolean' ? isDone : null,
    ]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, categoryId: row.category_id,
    title: row.title, description: row.description,
    startDate: row.start_date, endDate: row.end_date,
    isDone: row.is_done, completedAt: row.completed_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function deleteTodo(client, todoId, userId) {
  const result = await client.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2',
    [todoId, userId]
  );
  return result.rowCount;
}

module.exports = { insertTodo, findTodosByUserId, findTodoById, updateTodo, deleteTodo };
