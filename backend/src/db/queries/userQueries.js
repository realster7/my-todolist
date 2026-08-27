async function createUser(client, { email, passwordHash, name }) {
  const result = await client.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email, passwordHash, name]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findUserByEmail(client, email) {
  const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function updateUser(client, id, { name, passwordHash }) {
  const result = await client.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         password = COALESCE($3, password),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, name, created_at, updated_at`,
    [id, name ?? null, passwordHash ?? null]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { createUser, findUserByEmail, updateUser };
