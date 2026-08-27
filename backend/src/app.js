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

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
