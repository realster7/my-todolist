require('dotenv').config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parsedPort = Number(process.env.PORT);

// CORS_ORIGIN 쉼표구분 목록 (예: "http://localhost:5173,https://example.com").
// 미설정 시 개발 편의를 위해 true(모든 origin 허용+반사)로 폴백.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : true;

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  // Number.isNaN 체크: PORT=0(임의 포트 할당)이 falsy라 3000으로 튕기는 걸 방지
  port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
  corsOrigin,
};
