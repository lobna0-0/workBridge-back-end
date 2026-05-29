const express = require('express');

const router = express.Router();

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage()
});

const PortfolioController = require('../controllers/portfolio.controller');

const { authMW } = require('../middleWare/auth.middleware');

router.post(
  '/',
  authMW,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  PortfolioController.createPortfolio
);

router.get(
  '/freelancer/:freelancerId',
  PortfolioController.getFreelancerPortfolio
);

router.delete(
  '/:id',
  authMW,
  PortfolioController.deletePortfolio
);

module.exports = router;