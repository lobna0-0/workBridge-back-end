const supabase = require('../config/supabase');

// create
exports.createProposal = (proposal) => {
  return supabase
    .from('proposals')
    .insert([proposal])
    .select();
};

// all
exports.getAllProposals = () => {
  return supabase
    .from('proposals')
    .select(`
      *,
      project:projects(title, client_id, status),
      freelancer:users(name, email, image),
      client:users(name)
    `);
};

// by id
exports.getProposalById = (id) => {
  return supabase
    .from('proposals')
    .select(`
      *,
      project:projects(*),
      freelancer:users(*),
      client:users(name, rating)
    `)
    .eq('id', id)
    .single();
};

// by project
exports.getProposalsByProject = (projectId) => {
  return supabase
    .from('proposals')
    .select(`
      *,
      project:projects(title, client_id),
      freelancer:users(name, email, image, rating)
    `)
    .eq('project_id', projectId);
};

// update
exports.updateProposal = (id, data) => {
  return supabase
    .from('proposals')
    .update(data)
    .eq('id', id)
    .select();
};

// delete
exports.deleteProposal = (id) => {
  return supabase
    .from('proposals')
    .delete()
    .eq('id', id)
    .select();
};