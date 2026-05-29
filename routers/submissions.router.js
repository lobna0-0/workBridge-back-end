
const express = require('express');
const SubmissionController = require('../controllers/submissions.controller');
const SubmissionModel = require('../models/submissions.model')
const router = express.Router();
const upload = require('../config/multer')
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');


// submit work with file
router.post('/', SubmissionController.createSubmission);

// get project submissions
router.get('/project/:projectId', SubmissionController.getProjectSubmissions);

// get all submissions (admin)
router.get('/admin/all', authMW, allowRoles('admin'), SubmissionController.getAllSubmissions);

router.get('/latest/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const submissions = await SubmissionModel.getByProject(projectId);

    if (!submissions || submissions.length === 0) {
      return res.json(null);
    }

    // آخر submission
    const latest = submissions.sort((a, b) => b.id - a.id)[0];

    return res.json(latest);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Failed to fetch latest submission'
    });
  }
});

// update status
router.put('/:id', authMW, SubmissionController.updateSubmissionStatus);

// delete submission (admin)
router.delete('/:id', authMW, allowRoles('admin'), SubmissionController.deleteSubmission);

router.post('/upload', upload.single('file'), SubmissionController.uploadFile);
module.exports = router;
