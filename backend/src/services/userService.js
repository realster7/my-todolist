const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const userQueries = require('../db/queries/userQueries');
const { AppError } = require('../utils/errors');

async function updateProfile(userId, { name, password }) {
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  const user = await userQueries.updateUser(pool, userId, { name, passwordHash });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }
  return user;
}

module.exports = { updateProfile };
