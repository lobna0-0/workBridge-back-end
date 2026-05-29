const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projects.controller');

const { allowRoles } = require('../middleWare/role.middleware');
const { authMW } = require('../middleWare/auth.middleware');

// ======================
// CREATE
// ======================
router.post(
  '/',
  authMW,
  allowRoles('client'),
  projectController.createProject
);

// ======================
// GET ALL
// ======================
router.get(
  '/',
  projectController.getAllProjects
);

// ======================
// GET CLIENT PROJECTS
// ======================
router.get(
  '/client/:id',
  authMW,
  projectController.getProjectsByClient
);

// ======================
// GET FREELANCER PROJECTS
// ======================
router.get(
  '/freelancer/:id',
  authMW,
  projectController.getProjectsByFreelancer
);

// ======================
// GET OR CREATE
// IMPORTANT: before /:id
// ======================
router.post(
  '/get-or-create',
  authMW,
  projectController.getOrCreateProject
);

// ======================
// GET BY ID
// ======================
router.get(
  '/:id',
  authMW,
  projectController.getProjectById
);

// ======================
// UPDATE
// ======================
router.put(
  '/:id',
  authMW,
  projectController.updateProject
);

// ======================
// DELETE
// ======================
router.delete(
  '/:id',
  authMW,
  projectController.deleteProject
);

module.exports = router;