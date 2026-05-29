const Notification = require('../models/notifications.model');
const { sendNotification } = require('../service/notifications.service');

exports.createNotificationHttp = async (req, res) => {
  try {
    const { user_id, title, message, type, project_id, event_key, redirect_url } = req.body;

    if (!user_id || (!title && !message)) {
      return res.status(400).json({ error: 'user_id and title or message required' });
    }

    if (req.user.id !== Number(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to create notifications for other users' });
    }

    // Use sendNotification service for consistent deduplication and socket emission
    const result = await sendNotification(user_id, {
      title,
      message,
      type,
      project_id,
      event_key,
      redirect_url
    });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } =
      await Notification.getNotificationsByUserId(userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { data, error } = await Notification.getAllNotifications();
    if (error) return res.status(500).json({ error });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { data, error } = await Notification.markAsRead(
      req.user.id,
      req.params.notificationId,
      req.user.role === 'admin'
    );

    if (error) return res.status(500).json({ error });
    if (!data) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { data, error } = await Notification.deleteNotification(
      req.user.id,
      req.params.notificationId,
      req.user.role === 'admin'
    );

    if (error) return res.status(500).json({ error });
    if (!data) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};