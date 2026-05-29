const SubmissionModel = require('../models/submissions.model');
const supabase = require('../config/supabase');
// const serviceSupabase = require('../config/supabaseService');

// File upload to Supabase storage (fix RLS by using service key or public bucket)
exports.uploadFile = async (req, res) => {
  try {
    console.log('Incoming file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `submissions/${Date.now()}-${req.file.originalname}`;

    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      console.error(' Upload Error:', error);
      return res.status(500).json({ message: error.message });
    }

    const { data: publicData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    console.log(' Uploaded:', publicData.publicUrl);

    return res.json({ url: publicData.publicUrl });

  } catch (err) {
    console.error(' Server Error:', err);
    return res.status(500).json({ message: err.message });
  }
};
// Create submission with file url
exports.createSubmission = async (req, res) => {
  try {
    const { project_id, freelancer_id, file_url, message } = req.body;

    const submission = await SubmissionModel.create({
      project_id: Number(project_id),
      freelancer_id: Number(freelancer_id),
      file_url,
      message: message || '',
      status: 'pending'
    });

    const created = Array.isArray(submission) ? submission[0] : submission;
    const submissionId = created?.id;

    if (submissionId) {

      // get project owner (client)
      const { data: project } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', Number(project_id))
        .single();

      if (project?.client_id) {

        const { sendNotification } = require('../service/notifications.service');

        await sendNotification(project.client_id, {
          title: 'Work Submitted ',
          message: 'A freelancer submitted work for your project',
          type: 'submission',
          project_id: project_id,

          // ======================
          //  NAVIGATION PATH
          // ======================
          redirect_url: `/client/project/${project_id}`,

          // ======================
          //  UNIQUE EVENT KEY
          // ======================
          event_key: `submission_created:${submissionId}:${project.client_id}`
        });
      }
    }

    return res.status(201).json(submission);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Failed to create submission'
    });
  }
};

// Get submissions for project
exports.getProjectSubmissions = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        message: 'projectId is required'
      });
    }

    const submissions = await SubmissionModel.getByProject(projectId);

    return res.json(submissions);

  } catch (err) {
    console.error('Get Submissions Error:', err);
    return res.status(500).json({
      message: 'Failed to fetch submissions'
    });
  }
};

// Update status (approve / reject)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    // fetch current submission for notification routing
    const { data: submission } = await supabase
      .from('submissions')
      .select('id, freelancer_id, project_id')
      .eq('id', Number(id))
      .single();

    const updated = await SubmissionModel.updateStatus(id, status);


    // ======================
    //  Notify freelancer (work approved/rejected)
    // ======================
    if (submission?.freelancer_id && (status === 'approved' || status === 'rejected')) {
  const { sendNotification } = require('../service/notifications.service');

  await sendNotification(submission.freelancer_id, {
    title: status === 'approved' ? 'Work Approved ' : 'Work Rejected',
    message: status === 'approved'
      ? 'Your submitted work was approved'
      : 'Your submitted work was rejected',
    type: 'submission',
    project_id: submission.project_id,

    // navigation مهم
    redirect_url: status === 'approved'
      ? `/freelancer/projects/${submission.project_id}`
      : `/freelancer/submit-work/${submission.project_id}`,

    event_key: `submission_${status}:${submission.id}:${submission.freelancer_id}`
  });
}

    return res.json(updated);

  } catch (err) {
    console.error('Update Submission Error:', err);
    return res.status(500).json({
      message: 'Failed to update status'
    });
  }
};

// Get all submissions (ADMIN)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmissionModel.getAllSubmissions();
    return res.json(submissions);
  } catch (err) {
    console.error('Get All Submissions Error:', err);
    return res.status(500).json({
      message: 'Failed to fetch submissions'
    });
  }
};

// Delete submission (ADMIN)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await SubmissionModel.getBySubmissionId(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    await SubmissionModel.deleteSubmission(id);
    return res.json({ message: 'Submission deleted successfully', data: submission });

  } catch (err) {
    console.error('Delete Submission Error:', err);
    return res.status(500).json({
      message: 'Failed to delete submission'
    });
  }
};


