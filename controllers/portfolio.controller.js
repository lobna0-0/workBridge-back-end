const { randomUUID } = require('crypto');
const path = require('path');

const supabase = require('../config/supabase');
const Portfolio = require('../models/portfolio.model');

const BUCKET = 'portfolio-files';

exports.createPortfolio = async (req, res) => {
  try {
    const {
      title,
      description,
      github_url,
      live_demo,
      technologies
    } = req.body;

    // parse skills IDs
    let technologiesParsed = [];

    try {
      technologiesParsed = technologies
        ? JSON.parse(technologies)
        : [];
    } catch (e) {
      technologiesParsed = [];
    }

    let image_url = null;
    let file_url = null;

    // IMAGE
    if (req.files?.image?.[0]) {
      const image = req.files.image[0];
      const imageExt = path.extname(image.originalname);
      const imageName = `${randomUUID()}${imageExt}`;
      const imagePath = `images/${imageName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(imagePath, image.buffer, {
          contentType: image.mimetype
        });

      if (error) throw error;

      image_url = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(imagePath).data.publicUrl;
    }

    // FILE
    if (req.files?.file?.[0]) {
      const file = req.files.file[0];
      const fileExt = path.extname(file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;
      const filePath = `files/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype
        });

      if (error) throw error;

      file_url = supabase
        .storage
        .from(BUCKET)
        .getPublicUrl(filePath).data.publicUrl;
    }

    //  create portfolio ONLY
    const portfolio = await Portfolio.createPortfolio({
        freelancer_id: req.user.id,
        title,
        description,
        image_url,
        file_url,
        github_url,
        live_demo,
        technologies: technologiesParsed 
    });

    //  link skills (IMPORTANT PART)
    if (Array.isArray(technologiesParsed) && technologiesParsed.length) {
      const rows = technologiesParsed.map(skill_id => ({
        portfolio_id: portfolio.id,
        skill_id
      }));

      await supabase
        .from('portfolio_skills')
        .insert(rows);
    }

    res.status(201).json({
      success: true,
      portfolio
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
exports.getFreelancerPortfolio = async (req, res) => {
  try {

    const portfolios = await Portfolio.getByFreelancer(
      req.params.freelancerId
    );

    res.json(portfolios);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.deletePortfolio = async (req, res) => {
  try {

    const portfolio = await Portfolio.getById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found'
      });
    }

    if (portfolio.freelancer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized'
      });
    }

    await Portfolio.deletePortfolio(req.params.id);

    res.json({
      success: true
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};