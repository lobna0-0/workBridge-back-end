const supabase = require('../config/supabase');
const { getIO } = require('../socket');

const validateString = (value) =>
  value == null ? '' : String(value).trim();

const buildRedirectUrl = ({ role, type, projectId }) => {
  if (!projectId) return null;

  switch (type) {
    case 'message':
      return role === 'client'
        ? `/client/chat/${projectId}`
        : `/freelancer/chat/${projectId}`;

    case 'proposal':
      return role === 'client'
        ? `/client/proposals-on-job/${projectId}`
        : `/freelancer/project/${projectId}`;

    case 'submission':
    case 'project':
      return role === 'client'
        ? `/client/project/${projectId}`
        : `/freelancer/project/${projectId}`;

    case 'payment':
      return role === 'client'
        ? `/client/payments`
        : `/freelancer/earnings`;

    default:
      return null;
  }
};

const generateEventKey = (notification, userId) => {
  if (notification.event_key) {
    return validateString(notification.event_key);
  }

  const type = validateString(notification.type) || 'system';
  const projectId = notification.project_id || 'none';
  const senderId = notification.sender_id || 'system';
  const action = notification.action || 'created';

  return [type, action, projectId, senderId, userId].join(':');
};

exports.sendNotification = async (userId, notification) => {
  try {
    if (!userId || !notification) {
      return { error: 'Missing notification recipient or payload' };
    }

    const { data: recipient, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('id', userId)
      .single();

    if (userError || !recipient) {
      return { error: userError?.message || 'Recipient not found' };
    }

    const title = validateString(notification.title);
    const message = validateString(notification.message);
    const type = validateString(notification.type) || 'system';

    if (!title && !message) {
      return { error: 'Notification must include title or message' };
    }

    const eventKey = generateEventKey(notification, userId);

    // optional dedup
    if (eventKey) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('event_key', eventKey)
        .maybeSingle();

      if (existing) {
        console.log('[notification] duplicate skipped:', eventKey);
        return { data: existing, duplicate: true };
      }
    }

    const payload = {
      user_id: recipient.id,
      role: recipient.role,
      title,
      message,
      type,
      project_id: notification.project_id || null,
      sender_id: notification.sender_id || null,
      sender_name: validateString(notification.sender_name),
      event_key: eventKey,
      is_read: false,
      redirect_url: notification.redirect_url ||
        buildRedirectUrl({
          role: recipient.role,
          type,
          projectId: notification.project_id
        })
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error('[notification] insert error', error);
      return { error };
    }

    const io = getIO();

    const room = `user_${recipient.id}`;

    console.log('[notification emit]', {
      room,
      notificationId: data.id
    });

    if (io) {
      io.to(room).emit('notification', data);
    }

    return { data };
  } catch (err) {
    console.error('[notification] fatal', err);
    return { error: err.message };
  }
};