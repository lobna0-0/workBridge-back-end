const supabase = require('../config/supabase');

exports.createMessage = async (message) => {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select(`
            *,
            sender:users!messages_sender_id_fkey (
                id,
                name,
                image,
                email,
                rating
            ),
            receiver:users!messages_receiver_id_fkey (
                id,
                name,
                image,
                email,
                rating
            )
        `)
        .single();

    if (error) throw error;
    return data;
};

exports.getMessagesByUser = async (userId) => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:users!messages_sender_id_fkey (
                id,
                name,
                image,
                email,
                rating
            ),
            receiver:users!messages_receiver_id_fkey (
                id,
                name,
                image,
                email,
                rating
            )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

exports.getMessageById = async (id) => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:users!messages_sender_id_fkey (
                id,
                name,
                image,
                email,
                rating
            ),
            receiver:users!messages_receiver_id_fkey (
                id,
                name,
                image,
                email,
                rating
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

exports.getMessageByProjectId = async (project_id) => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
  *,
  project:projects (
    id,
    title
  ),
  sender:users!messages_sender_id_fkey (
    id,
    name,
    image,
    email,
    rating
  ),
  receiver:users!messages_receiver_id_fkey (
    id,
    name,
    image,
    email,
    rating
  )
`)
        .eq('project_id', project_id)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

exports.checkUserInProject = async (projectId, userId) => {
    const { data, error } = await supabase
        .from('projects')
        .select('client_id, freelancer_id')
        .eq('id', projectId)
        .single();

    if (error) throw error;

    if (!data) return false;

    return data.client_id === userId || data.freelancer_id === userId;
};

exports.updateMessage = async (id, message) => {
    const { data, error } = await supabase
        .from('messages')
        .update(message)
        .eq('id', id)
        .select(`
            *,
            sender:users!messages_sender_id_fkey (
                id,
                name,
                image,
                email,
                rating
            ),
            receiver:users!messages_receiver_id_fkey (
                id,
                name,
                image,
                email,
                rating
            )
        `)
        .single();

    if (error) throw error;
    return data;
};

exports.deleteMessage = async (id) => {
    const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)
        .select(`
            *,
            sender:users!messages_sender_id_fkey (
                id,
                name,
                image,
                email,
                rating
            ),
            receiver:users!messages_receiver_id_fkey (
                id,
                name,
                image,
                email,
                rating
            )
        `)
        .single();

    if (error) throw error;
    return data;
};