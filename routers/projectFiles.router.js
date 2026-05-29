const express = require('express');
const router = express.Router();
const ProjectFileController = require('../controllers/projectFiles.controller');
const { authMW } = require('../middleWare/auth.middleware');

// POST /api/project-files/upload
router.post('/upload', authMW, ProjectFileController.uploadFile);

// GET /api/project-files/project/:projectId
router.get('/project/:projectId', authMW, ProjectFileController.getProjectFiles);

// DELETE /api/project-files/:id
router.delete('/:id', authMW, ProjectFileController.deleteFile);

module.exports = router;

