const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const config = require('./config/env');
const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Vercel 등 리버스 프록시 뒤에서 X-Forwarded-For를 신뢰해야 express-rate-limit이
// 프록시 IP 하나가 아니라 실제 요청자 IP별로 카운트한다.
app.set('trust proxy', 1);

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  // nodeEnv 노출: Vercel 환경변수 설정이 실제로 반영됐는지 배포본에서 바로 확인하기 위함
  // (예: /docs가 운영에서도 열려있으면 여기 값으로 NODE_ENV 설정 여부를 바로 진단 가능).
  res.json({ status: 'ok', nodeEnv: config.nodeEnv });
});
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

// 개발 환경에서만 Swagger UI 노출 (운영에서는 API 명세를 외부에 공개하지 않음)
if (config.nodeEnv !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use(notFoundHandler);
app.use(errorHandler);

/* node:coverage disable */
if (require.main === module) {
  pool
    .query('SELECT 1')
    .then(() => {
      console.log('Database connection established');
      app.listen(config.port, () => {
        console.log(`TodoList API listening on port ${config.port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to database:', err.message);
      process.exit(1);
    });
}
/* node:coverage enable */

module.exports = app;
