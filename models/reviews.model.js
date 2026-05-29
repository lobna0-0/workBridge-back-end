const supabase = require('../config/supabase');

// Create review
exports.createReview = async (review) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get project reviews
exports.getReviewsByProject = async (projectId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey(id,name,image),
      reviewee:users!reviews_reviewee_id_fkey(id,name,image)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get user reviews (freelancer profile)
exports.getReviewsByUser = async (userId, type = 'reviewee') => {
  const field = type === 'reviewer' ? 'reviewer_id' : 'reviewee_id';

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey(id,name,image),
      reviewee:users!reviews_reviewee_id_fkey(id,name,image)
    `)
    .eq(field, userId);

  if (error) throw error;
  return data;
};

// Check project status
exports.getProjectStatus = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select('id,status,client_id,freelancer_id')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
};

// Prevent duplicates
exports.findExistingReview = async ({ project_id, reviewer_id, reviewee_id }) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('project_id', project_id)
    .eq('reviewer_id', reviewer_id)
    .eq('reviewee_id', reviewee_id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Recalculate rating
exports.recomputeRating = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId);

  if (error) throw error;

  const list = data || [];

  const avg =
    list.length === 0
      ? 0
      : list.reduce((s, r) => s + Number(r.rating), 0) / list.length;

  await supabase
    .from('users')
    .update({ rating: Number(avg.toFixed(2)) })
    .eq('id', userId);

  return avg;
};

/* =========================
   GET REVIEW BY ID
========================= */
exports.getReviewById = async (id) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`id, project_id, reviewer_id, reviewee_id, rating, comment, created_at`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/* =========================
   UPDATE REVIEW
========================= */
exports.updateReview = async (id, patch) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/* =========================
   DELETE REVIEW
========================= */
exports.deleteReview = async (id) => {
  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

/* =========================
   GET ALL REVIEWS (ADMIN)
========================= */
exports.getAllReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey(id,name,image,email),
      reviewee:users!reviews_reviewee_id_fkey(id,name,image,email),
      project:projects!reviews_project_id_fkey(id,title)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
