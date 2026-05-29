const express = require('express');
const router = express.Router();
const userRouter = require('./user.router');
const projectRouter = require('./projects.router');
const proposalRouter = require('./proposal.router');
const reportRouter = require('./reports.router');
const messageRouter = require('./messages.router');
const notificationRouter = require('./notifications.router');
const paymentRouter = require('./payment.router');
const submissionRouter = require('./submissions.router');
const categoriesRouter = require('./categories.router');
const reviewsRouter = require('./reviews.router');
const categorySkillsRouter = require('./categorySkills.router');
const chatRoomsRouter = require('./chatRooms.router');
const projectFilesRouter = require('./projectFiles.router');
const skillsRouter = require('./skills.router');
const portfolioRouter = require('./portfolio.router');
const withdrawalRouter = require('./withdrawal.router');

//routes
router.use('/users', userRouter);

router.use('/projects', projectRouter);
router.use('/proposals', proposalRouter);
router.use('/reports', reportRouter);
router.use('/messages', messageRouter);
router.use('/notifications', notificationRouter);
router.use('/payments', paymentRouter);
router.use('/submissions', submissionRouter);
router.use('/categories', categoriesRouter);
router.use('/reviews', reviewsRouter);
router.use('/category-skills', categorySkillsRouter);
router.use('/skills', skillsRouter);
router.use('/chat-rooms', chatRoomsRouter);
router.use('/project-files', projectFilesRouter);
router.use('/portfolio', portfolioRouter);
router.use('/withdrawals', withdrawalRouter);

module.exports = router;
