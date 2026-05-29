const Withdrawal = require('../models/withdrawal.model');
const Payment = require('../models/payment.model');

// ================= CREATE =================
exports.createWithdrawal = async (req, res) => {
  try {
    const freelancerId = req.user.id;
    const { amount, account_details } = req.body;

    const earnings =
      await Payment.getTotalFreelancerEarnings(freelancerId);

    const withdrawn =
      await Withdrawal.getTotalWithdrawn(freelancerId);

    const availableBalance = earnings - withdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({
        error: 'Insufficient balance'
      });
    }

    const withdrawal =
      await Withdrawal.createWithdrawal({
        freelancer_id: freelancerId,
        amount,
        account_details,
        status: 'pending'
      });

    res.json(withdrawal);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET MY WITHDRAWALS =================
exports.getMyWithdrawals = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const data =
      await Withdrawal.getWithdrawalsByFreelancer(freelancerId);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAllWithdrawals = async (req, res) => {
  try {
    const data = await Withdrawal.getAllWithdrawals();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ================= AVAILABLE BALANCE =================
exports.getAvailableBalance = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const earnings =
      await Payment.getTotalFreelancerEarnings(freelancerId);

    const withdrawn =
      await Withdrawal.getTotalWithdrawn(freelancerId);

    res.json({
      earnings,
      withdrawn,
      available: earnings - withdrawn
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE STATUS (ADMIN) =================
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated =
      await Withdrawal.updateWithdrawalStatus(id, { status });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};