const categoryService = require('../services/categoryService');

async function list(req, res) {
  try {
    const categories = await categoryService.listCategories(req.user.id);
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err.stack);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' } });
  }
}

module.exports = { list };
