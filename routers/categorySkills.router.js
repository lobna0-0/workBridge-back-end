const express = require('express');
const router = express.Router();
const CategorySkillController = require('../controllers/categorySkills.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');

// GET /api/category-skills/all (admin)
router.get('/all', authMW, allowRoles('admin'), CategorySkillController.getAllCategorySkills);

// POST /api/category-skills/assign
router.post('/assign', authMW, allowRoles('admin'), CategorySkillController.assignSkillToCategory);

// GET /api/category-skills/category/:categoryId
router.get('/category/:categoryId', CategorySkillController.getSkillsByCategory);

// DELETE /api/category-skills/:category_id/:skill_id
router.delete('/:category_id/:skill_id', authMW, allowRoles('admin'), CategorySkillController.removeSkillFromCategory);

module.exports = router;

