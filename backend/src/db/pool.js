const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  // 클라우드 Postgres(Neon/Supabase 등)는 SSL 연결을 강제하는데, pg는 연결 문자열에
  // sslmode가 없으면 SSL을 안 씀 → 운영에서만 SSL을 켠다(로컬 개발 DB는 SSL 미지원).
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
