const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signAccessToken(userId) {
  return jwt.sign({ userId }, config.jwtAccessSecret, { expiresIn: config.jwtAccessExpiresIn });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
