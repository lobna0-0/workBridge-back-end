const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notifications.controller');
const {authMW} = require('../middleWare/auth.middleware');
const {allowRoles} = require('../middleWare/role.middleware');


// create notification
router.post('/', authMW, Notification.createNotificationHttp);
// get notifications by user id
router.get('/', authMW, Notification.getNotificationByUserId);

// get all notifications (admin)
router.get('/admin/all', authMW, allowRoles('admin'), Notification.getAllNotifications);

// mark notification as read
router.put('/mark-as-read/:notificationId', authMW, Notification.markAsRead);

// mark all notifications as read for a user
router.put('/mark-all-as-read', authMW, Notification.markAllAsRead);
// delete notification
router.delete('/:notificationId', authMW, Notification.deleteNotification);

module.exports = router;