const supabase = require('../config/supabase');
// create report
exports.createReport = async (report) =>{
    return await supabase.from('reports').insert([report]).select();
}
// get all reports
exports.getAllReports = async () => {

  const { data, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) throw error;

  return data
};
// get report by id
exports.getReportById = async (id) =>{
    return await supabase.from('reports').select().eq('id', id).single();
}
// update report
exports.updateReport = async (id, report) =>{
    return await supabase.from('reports').update(report).eq('id', id).select();
}
// delete report
exports.deleteReport = async (id) =>{
    return await supabase.from('reports').delete().eq('id', id).select();
}
