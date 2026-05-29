const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviews.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');

router.post('/', authMW, ReviewController.createReview);

router.get('/project/:projectId', ReviewController.getProjectReviews);

router.get('/user/:id', ReviewController.getUserReviews);

// get all reviews (admin)
router.get('/admin/all', authMW, allowRoles('admin'), ReviewController.getAllReviews);

// edit review
router.patch('/:id', authMW, ReviewController.updateReview);

// delete review
router.delete('/:id', authMW, ReviewController.deleteReview);

module.exports = router;
