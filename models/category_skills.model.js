const supabase = require('../config/supabase');

// Create category-skill link
exports.createCategorySkill = async ({ category_id, skill_id }) => {
  const { data, error } = await supabase
    .from('category_skills')
    .insert([{ category_id, skill_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get skills by category
exports.getSkillsByCategory = async (category_id) => {
  const { data, error } = await supabase
    .from('category_skills')
    .select('skill_id, skills(name)')
    .eq('category_id', category_id);
  if (error) throw error;
  return data;
};

// Get categories by skill
exports.getCategoriesBySkill = async (skill_id) => {
  const { data, error } = await supabase
    .from('category_skills')
    .select('category_id, categories(name)')
    .eq('skill_id', skill_id);
  if (error) throw error;
  return data;
};

// Delete link
exports.deleteCategorySkill = async (category_id, skill_id) => {
  const { data, error } = await supabase
    .from('category_skills')
    .delete()
    .eq('category_id', category_id)
    .eq('skill_id', skill_id);
  if (error) throw error;
  return data;
};

// Get all category-skills with names
exports.getAllCategorySkills = async () => {
  const { data, error } = await supabase
    .from('category_skills')
    .select('category_id, skill_id, categories(id, name), skills(id, name)');
  if (error) throw error;
  return data;
};

