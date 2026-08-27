const pool = require('../db/pool');
const todoQueries = require('../db/queries/todoQueries');
const categoryService = require('../services/categoryService');
const { AppError } = require('../utils/errors');
const { computeTodoStatus } = require('../utils/computeTodoStatus');

async function createTodo(userId, { title, description, startDate, endDate, categoryId }) {
  if (new Date(startDate) > new Date(endDate)) {
    throw new AppError(400, 'INVALID_DATE_RANGE', '종료일은 시작일보다 빠를 수 없습니다.');
  }

  const categories = await categoryService.listCategories(userId);
  let targetCategoryId = categoryId;

  if (!targetCategoryId) {
    const defaultCategory = categories.find((c) => c.name === '기본');
    if (!defaultCategory) {
      throw new AppError(500, 'DEFAULT_CATEGORY_MISSING', '기본 카테고리를 찾을 수 없습니다.');
    }
    targetCategoryId = defaultCategory.id;
  } else if (!categories.some((c) => c.id === targetCategoryId)) {
    throw new AppError(400, 'INVALID_CATEGORY', '유효하지 않은 카테고리입니다.');
  }

  return todoQueries.insertTodo(pool, {
    userId,
    categoryId: targetCategoryId,
    title,
    description,
    startDate,
    endDate,
  });
}

async function listTodos(userId, { categoryId, status } = {}) {
  const todos = await todoQueries.findTodosByUserId(pool, userId, { categoryId });
  const withStatus = todos.map((todo) => ({ ...todo, status: computeTodoStatus(todo) }));
  if (status) {
    return withStatus.filter((todo) => todo.status === status);
  }
  return withStatus;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function updateTodo(userId, todoId, patch) {
  if (!UUID_RE.test(todoId)) {
    throw new AppError(400, 'VALIDATION_ERROR', '유효하지 않은 id 형식입니다.');
  }

  const existing = await todoQueries.findTodoById(pool, todoId, userId);
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  }

  const nextStart = patch.startDate ?? existing.startDate;
  const nextEnd = patch.endDate ?? existing.endDate;
  if (new Date(nextStart) > new Date(nextEnd)) {
    throw new AppError(400, 'INVALID_DATE_RANGE', '종료일은 시작일보다 빠를 수 없습니다.');
  }

  if (patch.categoryId) {
    const categories = await categoryService.listCategories(userId);
    if (!categories.some((c) => c.id === patch.categoryId)) {
      throw new AppError(400, 'INVALID_CATEGORY', '유효하지 않은 카테고리입니다.');
    }
  }

  const descriptionProvided = Object.prototype.hasOwnProperty.call(patch, 'description');

  return todoQueries.updateTodo(pool, todoId, userId, {
    title: patch.title,
    descriptionProvided,
    description: patch.description,
    startDate: patch.startDate,
    endDate: patch.endDate,
    categoryId: patch.categoryId,
    isDone: patch.isDone,
  });
}

async function deleteTodo(userId, todoId) {
  if (!UUID_RE.test(todoId)) {
    throw new AppError(400, 'VALIDATION_ERROR', '유효하지 않은 id 형식입니다.');
  }
  const rowCount = await todoQueries.deleteTodo(pool, todoId, userId);
  if (rowCount === 0) {
    throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  }
}

module.exports = { createTodo, listTodos, updateTodo, deleteTodo };
