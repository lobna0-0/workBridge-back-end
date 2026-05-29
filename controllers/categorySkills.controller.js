const CategorySkill = require('../models/category_skills.model');
const { authMW, allowRoles } = require('../middleWare/auth.middleware');

// Assign skill to category (admin)
exports.assignSkillToCategory = async (req, res) => {
  // Auth and role check handled in router
  try {
    const { category_id, skill_id } = req.body;
    const link = await CategorySkill.createCategorySkill({ category_id, skill_id });
    res.status(201).json({
      message: 'Skill assigned to category',
      data: link
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get skills by category
exports.getSkillsByCategory = async (req, res) => {
  try {
    const skills = await CategorySkill.getSkillsByCategory(req.params.categoryId);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Remove skill from category
exports.removeSkillFromCategory = async (req, res) => {
  // Auth and role check handled in router
  try {
    const { category_id, skill_id } = req.params;
    await CategorySkill.deleteCategorySkill(category_id, skill_id);
    res.json({ message: 'Skill removed from category' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all category-skills
exports.getAllCategorySkills = async (req, res) => {
  try {
    const links = await CategorySkill.getAllCategorySkills();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

