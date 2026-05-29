const supabase = require('../config/supabase');

// CREATE USER
exports.createUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()

  if (error) throw error;
  return data;
};

// GET ALL USERS (SAFE - NO COMPLEX JOINS)
exports.getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// GET USER BY ID (SAFE)
exports.getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)

  if (error) throw error;
  return data;
};

// GET BY EMAIL
exports.getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)


  if (error) throw error;
  return data;
};

// UPDATE USER
exports.updateUser = async (id, updateData) => {
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error;
  return data;
};

// DELETE USER
exports.deleteUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw error;
  return data;
};

// ================= PASSWORD RESET =================

exports.setPasswordResetToken = async (userId, resetToken, resetTokenExpires) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

exports.getUserByResetToken = async (resetToken) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_token', resetToken)  
    .limit(1);

  if (error) throw error;
  return data;
};

exports.updatePasswordAndClearResetToken = async (userId, hashedPassword) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

