const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');
const supabase = require('../config/supabase');


// GET /api/categories
router.get('/', categoriesController.getAllCategories);

// POST /api/categories (admin)
router.post('/', authMW, allowRoles('admin'), categoriesController.createCategory);
router.delete('/:id', authMW, allowRoles('admin'), categoriesController.deleteCategory);
router.put('/categories/:id', authMW, allowRoles('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
