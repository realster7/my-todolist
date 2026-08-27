const todoService = require('../services/todoService');
const { AppError } = require('../utils/errors');

const VALID_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'OVERDUE'];

async function create(req, res) {
  const { title, description, startDate, endDate, categoryId } = req.body || {};

  if (!title || !title.trim() || title.length > 200) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '제목을 입력해주세요(200자 이하).' } });
  }
  if (!startDate || Number.isNaN(Date.parse(startDate))) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효한 시작일자를 입력해주세요.' } });
  }
  if (!endDate || Number.isNaN(Date.parse(endDate))) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효한 종료일자를 입력해주세요.' } });
  }

  try {
    const todo = await todoService.createTodo(req.user.id, {
      title,
      description,
      startDate,
      endDate,
      categoryId,
    });
    return res.status(201).json(todo);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

async function list(req, res) {
  const { category, status } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 status 값입니다.' } });
  }

  try {
    const todos = await todoService.listTodos(req.user.id, { categoryId: category, status });
    return res.status(200).json(todos);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { title, description, startDate, endDate, categoryId, isDone } = req.body || {};

  if (title !== undefined && (!title.trim() || title.length > 200)) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '제목은 1~200자여야 합니다.' } });
  }
  if (startDate !== undefined && Number.isNaN(Date.parse(startDate))) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효한 시작일자를 입력해주세요.' } });
  }
  if (endDate !== undefined && Number.isNaN(Date.parse(endDate))) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: '유효한 종료일자를 입력해주세요.' } });
  }
  if (isDone !== undefined && typeof isDone !== 'boolean') {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: 'isDone은 boolean이어야 합니다.' } });
  }

  const patch = { title, startDate, endDate, categoryId, isDone };
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'description')) {
    patch.description = description;
  }

  try {
    const todo = await todoService.updateTodo(req.user.id, id, patch);
    return res.status(200).json(todo);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await todoService.deleteTodo(req.user.id, id);
    return res.status(204).send();
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    }
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

module.exports = { create, list, update, remove };
