const categoryQueries = require('../db/queries/categoryQueries');
const pool = require('../db/pool');

// MVP는 카테고리 생성 API를 제공하지 않으므로(1-domain-definition.md 2장),
// 가입 시 몇 가지 기본 카테고리를 미리 만들어준다. '기본'은 BR-04상 삭제 불가 대상이자
// 할일 등록 시 미지정 시 자동 배정되는 카테고리이므로 항상 포함·최우선 생성한다.
const PRESET_CATEGORY_NAMES = ['기본', '업무', '개인', '학습'];

async function createDefaultCategory(client, userId) {
  const categories = [];
  for (const name of PRESET_CATEGORY_NAMES) {
    categories.push(await categoryQueries.createCategory(client, { userId, name }));
  }
  return categories;
}

async function listCategories(userId) {
  return categoryQueries.findCategoriesByUserId(pool, userId);
}

module.exports = { createDefaultCategory, listCategories };
