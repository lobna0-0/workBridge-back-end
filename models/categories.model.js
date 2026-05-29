const supabase = require('../config/supabase');

// Create category
exports.createCategory = async (category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get all categories
exports.getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

// Get by ID
exports.getCategoryById = async (id) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// Update
exports.updateCategory = async (id, data) => {
  const { data: result, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
};

// Delete
exports.deleteCategory = async (id) => {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

