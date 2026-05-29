const supabase = require('../config/supabase');
const Project = require('../models/projects.model');


// ======================
// CREATE PROJECT (FIXED + SKILLS READY)
// ======================
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      category_id,
      category,
      location,
      skills = []
    } = req.body;

    let finalCategoryId = category_id;

    // category lookup
    if (category && !category_id) {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(400).json({ error: 'Category not found' });
      }

      finalCategoryId = data.id;
    }

    // create project
    const project = await Project.createProject({
      client_id: req.user.id,
      title,
      description,
      budget,
      deadline,
      category_id: finalCategoryId,
      location
    });

    // 🔥 normalize result (important fix)
    const newProject = project[0] || project;
    const projectId = newProject.id;

    // ======================
    // SAVE SKILLS (JUNCTION TABLE)
    // ======================
    if (skills.length > 0) {
      const insertData = skills.map(skill_id => ({
        project_id: projectId,
        skill_id
      }));

      const { error: skillError } = await supabase
        .from('project_skills')
        .insert(insertData);

      if (skillError) throw skillError;
    }

    return res.status(201).json({
      message: 'Project created successfully',
      data: newProject
    });

  } catch (error) {
    console.log("🔥 CREATE PROJECT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
// ======================
// GET ALL
// ======================
exports.getAllProjects = async (req, res) => {
  try {
    const data = await Project.getAllProjects();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// GET BY ID
// ======================
exports.getProjectById = async (req, res) => {
  try {
    const data = await Project.getProjectById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// UPDATE
// ======================
exports.updateProject = async (req, res) => {
  try {
    const data = await Project.updateProject(req.params.id, req.body);

    res.json({
      message: 'Updated successfully',
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// DELETE
// ======================
exports.deleteProject = async (req, res) => {
  try {
    const data = await Project.deleteProject(req.params.id);

    res.json({
      message: 'Deleted successfully',
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// GET OR CREATE CHAT PROJECT
// ======================
exports.getOrCreateProject = async (req, res) => {
  try {
    const { client_id, freelancer_id } = req.body;

    const { data: existing, error: findError } = await supabase
  .from('projects')
  .select('*')
  .eq('client_id', client_id)
  .eq('freelancer_id', freelancer_id)
  .limit(1);
  const project = existing?.[0];

    if (findError) throw findError;

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: 'Already exists'
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id,
        freelancer_id,
        title: 'Chat Project',
        description: 'Chat between client and freelancer',
        budget: 0,
        status: 'chat',
        deadline: null,
        category_id: null,
        location: null
      })
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: data?.[0] || data
    });

  } catch (error) {
    console.error("GET OR CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
// ======================
// GET BY CLIENT
// ======================
exports.getProjectsByClient = async (req, res) => {
  try {

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
      .eq('client_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
// ======================
// GET BY FREELANCER (ACCEPTED ONLY)
// ======================
exports.getProjectsByFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.id;

    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        projects(
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
          )
        )
      `)
      .eq('freelancer_id', freelancerId)
      .eq('status', 'accepted');

    if (error) throw error;

    const projects = data.map(item => item.projects);

    res.status(200).json({
      success: true,
      data: projects
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};