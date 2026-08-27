const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const userQueries = require('../db/queries/userQueries');
const categoryService = require('./categoryService');
const { AppError } = require('../utils/errors');
const jwtUtil = require('../utils/jwt');

async function signup(email, password, name) {
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let user;
    try {
      user = await userQueries.createUser(client, { email, passwordHash, name });
    } catch (err) {
      if (err.code === '23505') {
        await client.query('ROLLBACK');
        throw new AppError(409, 'DUPLICATE_EMAIL', '이미 가입된 이메일입니다.');
      }
      throw err;
    }

    await categoryService.createDefaultCategory(client, user.id);

    await client.query('COMMIT');
    return user;
  } catch (err) {
    if (!(err instanceof AppError)) {
      await client.query('ROLLBACK');
    }
    throw err;
  } finally {
    client.release();
  }
}

async function login(email, password) {
  const user = await userQueries.findUserByEmail(pool, email);
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 일치하지 않습니다.');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 일치하지 않습니다.');
  }
  const accessToken = jwtUtil.signAccessToken(user.id);
  const refreshToken = jwtUtil.signRefreshToken(user.id);
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

module.exports = { signup, login };
