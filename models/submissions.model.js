const supabase = require('../config/supabase');

// Create submission
exports.create = async (data) => {
  const { project_id, freelancer_id, file_url, message } = data;

  const { data: result, error } = await supabase
    .from('submissions')
    .insert([
      {
        project_id,
        freelancer_id,
        file_url,
        message,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return result;
};

// Get submissions by project
exports.getByProject = async (projectId) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      project:projects!submissions_project_id_fkey (
        *,
        categories(name)
      ),
      freelancer:users!submissions_freelancer_id_fkey(name, email, image, rating)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Update status
exports.updateStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all submissions (ADMIN)
exports.getAllSubmissions = async () => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      project:projects!submissions_project_id_fkey (
        id,
        title,
        client_id,
        categories(name)
      ),
      freelancer:users!submissions_freelancer_id_fkey(id, name, email, image, rating)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Delete submission (ADMIN)
exports.deleteSubmission = async (id) => {
  const { data, error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

// Get submission by ID
exports.getBySubmissionId = async (id) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      freelancer:users!submissions_freelancer_id_fkey(id, name, email, image)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};