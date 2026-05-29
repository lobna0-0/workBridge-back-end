const supabase = require('../config/supabase');

// CREATE
exports.createPayment = async (data) => {
  const { data: result, error } = await supabase
    .from('payments')
    .insert([{
      project_id: data.project_id,
      client_id: data.client_id,
      freelancer_id: data.freelancer_id,
      amount: data.amount,
      platform_fee: data.platform_fee,
      freelancer_amount: data.freelancer_amount,
      status: data.status,
      stripe_payment_intent: data.stripe_payment_intent
    }])
    .select()
    .single();

  if (error) throw error;
  return result;
};


// COMPLETE
exports.completePayment = async (id, updates) => {
    const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// BY STRIPE ID with joins
// BY STRIPE ID with joins
// GET ALL PAYMENTS (ADMIN)
exports.getAllPayments = async () => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            project:projects(*),
            client:users!payments_client_id_fkey(id,name,email,image),
            freelancer:users!payments_freelancer_id_fkey(id,name,email,image,rating)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
};
exports.getPaymentByStripeId = async (stripeId) => {
    const { data, error } = await supabase
    .from('payments')
    .select(`
        *,
        project:projects(*),
        client:client_id(name, email, image),
        freelancer:freelancer_id(name, email, image, rating)
    `)
    .eq('stripe_payment_intent', stripeId)
    .maybeSingle();

    if (error) {
        console.error(error);
        return null;
    }

    return data;
};

// BY ID with joins
exports.getPaymentById = async (id) => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            project:projects(*),
            client:users!payments_client_id_fkey(
                id,
                name,
                email,
                image
            ),
            freelancer:users!payments_freelancer_id_fkey(
                id,
                name,
                email,
                image,
                rating
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

// GET BY CLIENT
exports.getPaymentsByClient = async (clientId) => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            project:projects(*),
            client:users!payments_client_id_fkey(id,name,email,image),
            freelancer:users!payments_freelancer_id_fkey(id,name,email,image,rating)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
};
// GET BY FREELANCER
exports.getPaymentsByFreelancer = async (freelancerId, page = 1, limit = 10) => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            project:projects(*),
            client:users!payments_client_id_fkey(
                id,
                name,
                email,
                image
            ),
            freelancer:users!payments_freelancer_id_fkey(
                id,
                name,
                email,
                image,
                rating
            )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return data;
};
// DELETE
exports.deletePayment = async (id) => {
    const { data, error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};
// ================= TOTAL FREELANCER EARNINGS =================
exports.getTotalFreelancerEarnings= async(freelancerId)=> {

  const { data, error } = await supabase
    .from('payments')
    .select('freelancer_amount')
    .eq('freelancer_id', freelancerId)
    .eq('status', 'paid');

  if (error) {
    throw error;
  }

  return data.reduce(
    (sum, item) => sum + Number(item.freelancer_amount || 0),
    0
  );
}
