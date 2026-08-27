const authService = require('../services/authService');
const jwtUtil = require('../utils/jwt');
const { AppError } = require('../utils/errors');

async function signup(req, res) {
  const { email, password, name } = req.body || {};

  if (!email || !email.includes('@')) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효한 이메일을 입력해주세요.' } });
  }
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '비밀번호는 8자 이상이어야 합니다.' } });
  }
  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '이름을 입력해주세요.' } });
  }

  try {
    const user = await authService.signup(email, password, name);
    return res.status(201).json(user);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '이메일과 비밀번호를 입력해주세요.' } });
  }

  try {
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken, user });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

async function refresh(req, res) {
  const token = req.cookies && req.cookies.refresh_token;

  if (!token) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: '리프레시 토큰이 없습니다.' } });
  }

  try {
    const payload = jwtUtil.verifyRefreshToken(token);
    const accessToken = jwtUtil.signAccessToken(payload.userId);
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res
      .status(401)
      .json({ error: { code: 'INVALID_REFRESH_TOKEN', message: '세션이 만료되었습니다. 다시 로그인해주세요.' } });
  }
}

module.exports = { signup, login, refresh };
