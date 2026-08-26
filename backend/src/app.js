const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const pool = require('./db/pool');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

module.exports = app;
