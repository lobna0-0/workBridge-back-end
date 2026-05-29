const express = require('express');

const router = express.Router();

const withdrawalController =
require('../controllers/withdrawal.controller');

const {
  authMW
} = require('../middleWare/auth.middleware');

const {
  allowRoles
} = require('../middleWare/role.middleware');

// ================= FREELANCER =================

// create withdrawal
router.post(
  '/',
  authMW,
  allowRoles('freelancer'),
  withdrawalController.createWithdrawal
);
// available balance
router.get(
  '/balance',
  authMW,
  allowRoles('freelancer'),
  withdrawalController.getAvailableBalance
);
// my withdrawals
router.get(
  '/my',
  authMW,
  allowRoles('freelancer'),
  withdrawalController.getMyWithdrawals
);

// ================= ADMIN =================

// get all
router.get(
  '/',
  authMW,
  allowRoles('admin'),
  withdrawalController.getAllWithdrawals
);

// update status
router.patch(
  '/:id/status',
  authMW,
  allowRoles('admin'),
  withdrawalController.updateWithdrawalStatus
);

module.exports = router;