const rateLimit = require('express-rate-limit');

// 로그인/가입 brute force·스팸 방어. IP당 15분에 10회.
// ponytail: 단일 인스턴스 기준 메모리 저장소(기본값) — 여러 서버리스 인스턴스에 걸쳐
// 카운트가 공유 안 되는 한계 있음, 트래픽 커지면 Redis 등 공유 저장소로 교체.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' } },
});

module.exports = { authRateLimiter };
