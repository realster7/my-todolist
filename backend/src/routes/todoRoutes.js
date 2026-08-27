const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const todoController = require('../controllers/todoController');

const router = express.Router();
router.use(authMiddleware);
router.post('/', todoController.create);
router.get('/', todoController.list);
router.patch('/:id', todoController.update);
router.delete('/:id', todoController.remove);

module.exports = router;
