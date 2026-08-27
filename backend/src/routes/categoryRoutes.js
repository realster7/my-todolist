const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const categoryController = require('../controllers/categoryController');

const router = express.Router();
router.use(authMiddleware);
router.get('/', categoryController.list);

module.exports = router;
