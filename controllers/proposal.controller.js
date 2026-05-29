const Proposal = require('../models/proposal.model');
const { sendNotification } = require('../service/notifications.service');
const supabase = require('../config/supabase');

// ======================
// CREATE PROPOSAL
// ======================
exports.createProposal = async (req, res) => {
  try {
    const proposal = {
      project_id: req.body.project_id,
      freelancer_id: req.user.id,
      cover_letter: req.body.cover_letter,
      bid_amount: req.body.bid_amount,
      delivery_time: req.body.delivery_time
    };

    const { data, error } = await Proposal.createProposal(proposal);
    if (error) return res.status(400).json({ error: error.message });

    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.id) {
      return res.status(500).json({ error: 'Proposal creation failed' });
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, client_id')
      .eq('id', created.project_id)
      .single();

    if (!project) {
      return res.status(500).json({ error: 'Project not found' });
    }

    await sendNotification(project.client_id, {
      title: 'New Proposal',
      message: 'A freelancer submitted a proposal',
      type: 'proposal',
      project_id: project.id,

      redirect_url: `/client/proposals-on-job/${project.id}`,

      event_key: `proposal_created:${created.id}:${project.id}:${project.client_id}`
    });

    return res.status(201).json({ success: true, data: created });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ======================
// GET ALL PROPOSALS
// ======================
exports.getAllProposals = async (req, res) => {
  try {
    const { data, error } = await Proposal.getAllProposals();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// GET BY ID
// ======================
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.getProposalById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ success: true, data: proposal });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// GET BY PROJECT
// ======================
exports.getProposalsByProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const { data, error } = await Proposal.getProposalsByProject(projectId);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// GET BY FREELANCER
// ======================
exports.getProposalsByFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.id;

    const { data, error } = await require('../config/supabase')
      .from('proposals')
      .select(`
        *,
        project:projects (
          id,
          title
        )
      `)
      .eq('freelancer_id', freelancerId);

    if (error) throw error;

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// UPDATE PROPOSAL
// ======================
exports.updateProposalById = async (req, res) => {
  try {
    const { data, error } = await Proposal.updateProposal(req.params.id, req.body);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// CHANGE STATUS
// ======================
exports.changeProposalStatus = async (req, res) => {
  try {

    const { status } = req.body;
    const proposalId = req.params.id;

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return res.status(404).json({
        error: 'Proposal not found'
      });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, client_id')
      .eq('id', proposal.project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    if (Number(project.client_id) !== Number(req.user.id)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    // update proposal status
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        error: updateError.message
      });
    }

    // ======================
    // ACCEPT
    // ======================
    if (status === 'accepted') {

      await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          freelancer_id: proposal.freelancer_id
        })
        .eq('id', proposal.project_id);

      // reject other proposals
      await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('project_id', proposal.project_id)
        .neq('id', proposal.id);

      const notificationResult = await sendNotification(
        proposal.freelancer_id,
        {
          title: 'Proposal Accepted',
          message: 'Your proposal was accepted',
          type: 'proposal',
          project_id: proposal.project_id,
          redirect_url: `/freelancer/projects`,
          event_key: `proposal_accepted:${proposal.id}`
        }
      );

      console.log(
        '[proposal accepted notification]',
        notificationResult
      );
    }

    // ======================
    // REJECT
    // ======================
    if (status === 'rejected') {

      const notificationResult = await sendNotification(
        proposal.freelancer_id,
        {
          title: 'Proposal Rejected',
          message: 'Your proposal was rejected',
          type: 'proposal',
          project_id: proposal.project_id,
          redirect_url: `/freelancer/projects`,
          event_key: `proposal_rejected:${proposal.id}`
        }
      );

      console.log(
        '[proposal rejected notification]',
        notificationResult
      );
    }

    return res.json({
      success: true,
      data: updatedProposal
    });

  } catch (err) {

    console.error(
      '[changeProposalStatus error]',
      err
    );

    return res.status(500).json({
      error: err.message
    });
  }
};

// ======================
// DELETE PROPOSAL
// ======================
exports.deleteProposal = async (req, res) => {
  try {
    const { data, error } = await Proposal.deleteProposal(req.params.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};