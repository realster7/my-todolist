const express = require('express');
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/signup', authRateLimiter, authController.signup);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);

module.exports = router;
