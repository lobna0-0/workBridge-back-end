const supabase = require('../config/supabase');

// Create skill
exports.createSkill = async (skill) => {
  const { data, error } = await supabase
    .from('skills')
    .insert([skill])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get all skills
exports.getAllSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

// Get by ID
exports.getSkillById = async (id) => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// Update
exports.updateSkill = async (id, data) => {
  const { data: result, error } = await supabase
    .from('skills')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
};

// Delete
exports.deleteSkill = async (id) => {
  const { data, error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

