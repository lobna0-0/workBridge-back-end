const supabase = require('../config/supabase');

// ======================
// CREATE PROJECT
// ======================
exports.createProject = async (project) => {
  try {
    const cleanProject = {
      title: project.title,
      description: project.description,
      budget: project.budget,
      deadline: project.deadline,
      category_id: project.category_id,
      client_id: project.client_id,
      freelancer_id: project.freelancer_id || null,
      status: project.status || 'open',
      location: project.location || null
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([cleanProject])
      .select(`
        *,
        category:categories(id, name),

        client:users!projects_client_id_fkey(
          id,
          name,
          email,
          image,
          rating
        ),

        freelancer:users!projects_freelancer_id_fkey(
          id,
          name,
          email,
          image,
          rating
        )
      `)
      .single();

    if (error) {
      console.log("🔥 SUPABASE ERROR:", error);
      throw error;
    }

    return data;

  } catch (err) {
    console.log("🔥 SERVER ERROR:", err);
    throw err;
  }
};

// ======================
// GET ALL PROJECTS
// ======================
exports.getAllProjects = async () => {

  const { data, error } = await supabase
    .from('projects')
    .select(`
  *,
  category:categories(id, name),

  client:users!projects_client_id_fkey(
    id,
    name,
    email,
    image,
    rating
  ),

  freelancer:users!projects_freelancer_id_fkey(
    id,
    name,
    email,
    image,
    rating
  ),

  project_skills(
    skills(
      id,
      name
    )
  ),

  proposals(count),
  submissions(count)
`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
};

// ======================
// GET PROJECT BY ID
// ======================
exports.getProjectById = async (id) => {

  const { data, error } = await supabase
    .from('projects')
    .select(`
  *,
  category:categories(id, name),

  client:users!projects_client_id_fkey(
    id,
    name,
    email,
    image,
    rating
  ),

  freelancer:users!projects_freelancer_id_fkey(
    id,
    name,
    email,
    image,
    rating
  ),

  project_skills(
    skills(
      id,
      name
    )
  ),

  proposals (
    *,
    freelancer:users(
      id,
      name,
      email,
      image,
      rating
    )
  ),

  submissions (
    *,
    freelancer:users(
      id,
      name,
      email,
      image,
      rating
    )
  )
`)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// ======================
// UPDATE PROJECT
// ======================
exports.updateProject = async (id, updateData) => {

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,

      category:categories(
        id,
        name
      ),

      client:users!projects_client_id_fkey(
        id,
        name,
        email,
        image,
        rating
      ),

      freelancer:users!projects_freelancer_id_fkey(
        id,
        name,
        email,
        image,
        rating
      )
    `)
    .single();

  if (error) throw error;

  return data;
};

// ======================
// DELETE PROJECT
// ======================
exports.deleteProject = async (id) => {

  const { error: reportsError } = await supabase
    .from('reports')
    .delete()
    .eq('project_id', id);

  if (reportsError) throw reportsError;

  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
};