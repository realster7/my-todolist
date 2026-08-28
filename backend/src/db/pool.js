const { Pool } = require('pg');
const config = require('../config/env');
const { withRetry } = require('./withRetry');

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  // 클라우드 Postgres(Neon/Supabase 등)는 SSL 연결을 강제하는데, pg는 연결 문자열에
  // sslmode가 없으면 SSL을 안 씀 → 운영에서만 SSL을 켠다(로컬 개발 DB는 SSL 미지원).
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// 콜드스타트 직후 첫 연결 시도만 재시도(withRetry.js 참조). pool.connect()로 얻은
// client의 query는 감싸지 않는다 — 트랜잭션 도중 에러는 재시도하면 안 됨.
const originalQuery = pool.query.bind(pool);
const originalConnect = pool.connect.bind(pool);
pool.query = (...args) => withRetry(() => originalQuery(...args));
pool.connect = (...args) => withRetry(() => originalConnect(...args));

module.exports = pool;
