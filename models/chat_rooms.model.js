const supabase = require('../config/supabase');

// Create chat room
exports.createChatRoom = async (room) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert([room])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get by project
exports.getByProject = async (project_id) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      client:users(name, image),
      freelancer:users(name, image)
    `)
    .eq('project_id', project_id)
    .single();
  if (error) throw error;
  return data;
};

// Get by users (client-freelancer)
exports.getByUsers = async (client_id, freelancer_id) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('client_id', client_id)
    .eq('freelancer_id', freelancer_id)
    .single();
  if (error) throw error;
  return data;
};

