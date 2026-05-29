const supabase = require('../config/supabase');


exports.createPortfolio = async (dataObj) => {

  const { data, error } = await supabase
    .from('portfolios')
    .insert([dataObj])
    .select()
    .single();

  if (error) throw error;

  return data;
};

exports.getByFreelancer = async (freelancerId) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      freelancer:users(id, name, image, rating),
      portfolio_skills(
        skills(id, name)
      )
    `)
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
};

exports.getById = async (id) => {

  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)


  if (error) return null;

  return data;
};

exports.deletePortfolio = async (id) => {

  const { data, error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return data;
};