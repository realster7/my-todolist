const categoryQueries = require('../db/queries/categoryQueries');
const pool = require('../db/pool');

async function createDefaultCategory(client, userId) {
  return categoryQueries.createCategory(client, { userId, name: '기본' });
}

async function listCategories(userId) {
  return categoryQueries.findCategoriesByUserId(pool, userId);
}

module.exports = { createDefaultCategory, listCategories };
