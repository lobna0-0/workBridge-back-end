const ReviewModel = require('../models/reviews.model');
const { sendNotification } = require('../service/notifications.service');

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const reviewer_id = req.user.id;
    const { project_id, reviewee_id, rating, comment } = req.body;

    if (!project_id || !reviewee_id) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const normalizedRating = Number(rating);
    const normalizedComment = (comment ?? '').toString().trim();

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    // Keep consistent with your frontend validation (min 20, max 500).
    if (normalizedComment.length < 20 || normalizedComment.length > 500) {
      return res
        .status(400)
        .json({ error: 'Comment must be between 20 and 500 characters' });
    }

    const project = await ReviewModel.getProjectStatus(project_id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.status !== 'completed') {
      return res.status(403).json({ error: 'Project not completed yet' });
    }

    if (![project.client_id, project.freelancer_id].includes(reviewer_id)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Duplicate prevention (works even if DB unique constraint is missing):
    const existing = await ReviewModel.findExistingReview({
      project_id,
      reviewer_id,
      reviewee_id
    });

    if (existing?.id) {
      return res.status(409).json({ error: 'Already reviewed' });
    }

    // Create review
    const created = await ReviewModel.createReview({
      project_id,
      reviewer_id,
      reviewee_id,
      rating: normalizedRating,
      comment: normalizedComment
    });

    await ReviewModel.recomputeRating(reviewee_id);

    await sendNotification(reviewee_id, {
      title: 'New Review',
      message: 'You received a new review and rating',
      type: 'review',
      project_id,
      event_key: `review_created:${project_id}:${reviewer_id}:user:${reviewee_id}`
    });

    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PROJECT REVIEWS
exports.getProjectReviews = async (req, res) => {
  try {
    const data = await ReviewModel.getReviewsByProject(req.params.projectId);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET USER REVIEWS
exports.getUserReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const type = req.query.type || 'reviewee';

    const data = await ReviewModel.getReviewsByUser(id, type);
    res.json({ data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET ALL REVIEWS (ADMIN)
// =========================
exports.getAllReviews = async (req, res) => {
  try {
    const data = await ReviewModel.getAllReviews();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE REVIEW
// =========================
exports.updateReview = async (req, res) => {
  try {
    const reviewer_id = req.user.id;
    const reviewId = req.params.id;

    const { rating, comment } = req.body;
    if (rating == null || comment == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const normalizedRating = Number(rating);
    const normalizedComment = (comment ?? '').toString().trim();

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    if (normalizedComment.length < 20 || normalizedComment.length > 500) {
      return res.status(400).json({ error: 'Comment must be between 20 and 500 characters' });
    }

    const existing = await ReviewModel.getReviewById(reviewId);
    if (!existing) return res.status(404).json({ error: 'Review not found' });

    const isOwnerOrAdmin =
      existing.reviewer_id === reviewer_id ||
      req.user.role === 'admin';

    if (!isOwnerOrAdmin) return res.status(403).json({ error: 'Not allowed' });

    // Prevent editing after 15 minutes of submission
    if (req.user.role !== 'admin') {
      const createdAt = new Date(existing.created_at);
      const createdMs = createdAt.getTime();
      const nowMs = Date.now();
      const fifteenMinutesMs = 15 * 60 * 1000;

      if (!Number.isNaN(createdMs) && (nowMs - createdMs) > fifteenMinutesMs) {
        return res.status(403).json({ error: 'Editing time window has expired' });
      }
    }

    const updated = await ReviewModel.updateReview(reviewId, {
      rating: Number(rating),
      comment
    });

    await ReviewModel.recomputeRating(existing.reviewee_id);

    res.status(200).json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DELETE REVIEW
// =========================
exports.deleteReview = async (req, res) => {
  try {
    const reviewer_id = req.user.id;
    const reviewId = req.params.id;

    const existing = await ReviewModel.getReviewById(reviewId);
    if (!existing) return res.status(404).json({ error: 'Review not found' });

    const isAllowed =
      existing.reviewer_id === reviewer_id ||
      req.user.role === 'admin';

    if (!isAllowed) return res.status(403).json({ error: 'Not allowed' });

    await ReviewModel.deleteReview(reviewId);

    await ReviewModel.recomputeRating(existing.reviewee_id);

    res.status(200).json({ data: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
