const userService = require('../services/userService');
const { AppError } = require('../utils/errors');

async function updateMe(req, res) {
  const { name, password } = req.body || {};

  if (name !== undefined && (!name.trim() || name.length > 100)) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '이름은 1~100자여야 합니다.' } });
  }
  if (password !== undefined && password.length < 8) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '비밀번호는 8자 이상이어야 합니다.' } });
  }
  if (name === undefined && password === undefined) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '변경할 이름 또는 비밀번호를 입력해주세요.' } });
  }

  try {
    const user = await userService.updateProfile(req.user.id, { name, password });
    return res.status(200).json(user);
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

module.exports = { updateMe };
