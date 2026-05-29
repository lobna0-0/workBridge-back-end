const supabase = require('../config/supabase');

// Create project file
exports.createProjectFile = async (fileData) => {
  const { data, error } = await supabase
    .from('project_files')
    .insert([fileData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get files by project
exports.getByProject = async (project_id) => {
  const { data, error } = await supabase
    .from('project_files')
    .select(`
      *,
      project:projects(title),
      uploaded_by_user:users(name, image)
    `)
    .eq('project_id', project_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Delete file
exports.deleteFile = async (id) => {
  const { data, error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

