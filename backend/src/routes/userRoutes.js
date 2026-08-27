const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();
router.use(authMiddleware);
router.patch('/me', userController.updateMe);

module.exports = router;
