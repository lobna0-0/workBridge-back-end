const supabase = require('../config/supabase');

exports.createNotification = async (userId, notification) => {
  const payload = {
    user_id: userId,
    role: notification.role,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'general',
    project_id: notification.project_id || null,
    sender_id: notification.sender_id || null,
    sender_name: notification.sender_name || null,
    event_key: notification.event_key || null
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert([payload])
    .select()
    .single();

  return { data, error };
};

exports.getNotificationsByUserId = async (userId) => {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

exports.getAllNotifications = async () => {
  return await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
};

exports.markAsRead = async (userId, notificationId, isAdmin = false) => {
  const query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (!isAdmin) {
    query.eq('user_id', userId);
  }

  return await query.select().single();
};

exports.markAllAsRead = async (userId) => {
  return await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
};

exports.deleteNotification = async (userId, notificationId, isAdmin = false) => {
  const query = supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (!isAdmin) {
    query.eq('user_id', userId);
  }

  return await query.select().single();
};