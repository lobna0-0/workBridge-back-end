const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages.controller');
const { authMW } = require('../middleWare/auth.middleware');

router.post('/', authMW, messageController.createMessage);

// router.get('/', authMW, messageController.);
router.get('/project/:projectId', authMW, messageController.getMessageByProjectId); //  before /:id
router.put('/:id', authMW, messageController.updateMessage);
router.delete('/:id', authMW, messageController.deleteMessage);

module.exports = router;