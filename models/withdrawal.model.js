const supabase = require('../config/supabase');

// ================= CREATE =================
exports.createWithdrawal = async (withdrawal) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .insert([withdrawal])
        .select()
        .single();

    if (error) throw error;

    return data;
};

// ================= GET TOTAL WITHDRAWN =================
exports.getTotalWithdrawn = async (freelancerId) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('freelancer_id', freelancerId)
        .in('status', ['pending', 'paid']);

    if (error) throw error;

    return data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );
};

// ================= GET ALL =================
exports.getAllWithdrawals = async () => {

    const { data, error } = await supabase
        .from('withdrawals')
        .select(`
            *,
            freelancer:users(
                id,
                name,
                email,
                image
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
};

// ================= GET BY FREELANCER =================
exports.getWithdrawalsByFreelancer = async (freelancerId) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .select(`
            *,
            freelancer:users(
                id,
                name,
                email,
                image
            )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
};

// ================= GET BY ID =================
exports.getWithdrawalById = async (id) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .select(`
            *,
            freelancer:users(
                id,
                name,
                email,
                image
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error(error);
        return null;
    }

    return data;
};

// ================= UPDATE STATUS =================
exports.updateWithdrawalStatus = async (id, updates) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

// ================= DELETE =================
exports.deleteWithdrawal = async (id) => {

    const { data, error } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};