async function createCategory(client, { userId, name }) {
  const result = await client.query(
    `INSERT INTO categories (user_id, name)
     VALUES ($1, $2)
     RETURNING id, user_id, name, created_at`,
    [userId, name]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function findCategoriesByUserId(client, userId) {
  const result = await client.query(
    'SELECT id, user_id, name, created_at FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  }));
}

module.exports = { createCategory, findCategoriesByUserId };
