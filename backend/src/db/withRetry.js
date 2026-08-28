// 연결 자체가 안 될 때만 재시도한다(쿼리가 DB까지 도달한 뒤의 에러, 예: unique_violation은
// 재시도해도 의미 없고 부작용만 생길 수 있어 제외). Vercel 같은 서버리스 콜드스타트 직후
// 첫 DB 연결 시도가 간헐적으로 실패하는 문제 대응.
const RETRYABLE_CODES = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EPIPE']);

// ponytail: 고정 backoff(300ms 단위 증가) + 최대 3회. 트래픽이 커지면 지수 백오프/지터로
// 바꿀 것 — 지금 규모(1인 개발, 서버리스 콜드스타트 대응)엔 과함.
async function withRetry(fn, { attempts = 3, delayMs = 300 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1 || !RETRYABLE_CODES.has(err.code)) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  return undefined;
}

module.exports = { withRetry, RETRYABLE_CODES };
