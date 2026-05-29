const express = require('express');
const router = express.Router();

const skillsController = require('../controllers/skills.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');

// GET /api/skills/all
router.get('/all', skillsController.getAllSkills);

// GET /api/skills/:id
// (get user skills)
router.get('/:id', skillsController.getUserSkills);

// PUT /api/skills
router.put(
  '/',
  authMW,
  allowRoles('freelancer'),
  skillsController.updateUserSkills
);

// POST /api/skills
router.post(
  '/',
  authMW,
  allowRoles('freelancer'),
  skillsController.addUserSkills
);

// DELETE /api/skills
router.delete(
  '/',
  authMW,
  allowRoles('freelancer'),
  skillsController.deleteUserSkill
);

module.exports = router;


