const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal.controller');
const { allowRoles } = require('../middleWare/role.middleware');
const { authMW } = require('../middleWare/auth.middleware');

// create
router.post('/', authMW, allowRoles('freelancer'), proposalController.createProposal);

// get all
router.get('/', authMW, proposalController.getAllProposals);

// get by project
router.get('/project/:id', authMW, proposalController.getProposalsByProject);

// get freelancer proposals
router.get('/freelancer/:id', authMW, proposalController.getProposalsByFreelancer);

// get by id
router.get('/:id', authMW, proposalController.getProposalById);

// change proposal status (accept/reject)
router.put('/:id/status', authMW, allowRoles('client'), proposalController.changeProposalStatus);

// update
router.put('/:id', authMW, proposalController.updateProposalById);

// delete
router.delete('/:id', authMW, proposalController.deleteProposal);

module.exports = router;