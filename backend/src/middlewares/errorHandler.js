const { AppError } = require('../utils/errors');

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: '요청한 경로를 찾을 수 없습니다.' } });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '요청 본문(JSON) 형식이 올바르지 않습니다.' } });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  console.error(err.stack);
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
}

module.exports = { notFoundHandler, errorHandler };
