const jwtUtil = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } });
  }

  try {
    const payload = jwtUtil.verifyAccessToken(token);
    req.user = { id: payload.userId };
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: '유효하지 않거나 만료된 토큰입니다.' } });
  }
}

module.exports = authMiddleware;
