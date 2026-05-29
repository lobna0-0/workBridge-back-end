const crypto = require('crypto');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/hashing');
const transporter = require('../utils/mailer');

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function generateResetToken() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const users = await User.getUserByEmail(email);
    const existing = users?.[0];

    // Always return success (security best practice)
    if (!existing) {
      return res.status(200).json({
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Expiry time
    const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // Save in DB
    await User.setPasswordResetToken(
      existing.id,
      resetToken,
      resetTokenExpires.toISOString()
    );

    // Reset link
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"WorkBridge" <${process.env.EMAIL_USER}>`,
      to: existing.email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link will expire in 2 hours.</p>
      `
    });

    return res.status(200).json({
  message: 'Reset link sent to your email',
  token: resetToken // REMOVE in production
});

  } catch (err) {
    return res.status(500).json({
      message: err.message || 'Forgot password failed'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and newPassword are required'
      });
    }

const cleanToken = token?.trim();

console.log("TOKEN RECEIVED:", cleanToken);

    const users = await User.getUserByResetToken(cleanToken);
    const user = users?.[0];

    if (!user) {
      return res.status(400).json({
        message: 'Invalid reset token'
      });
    }

    if (!user.reset_token_expires) {
      return res.status(400).json({
        message: 'Token missing expiry'
      });
    }

   const expires = new Date(user.reset_token_expires);
const now = new Date();

if (expires <= now) {
  return res.status(400).json({ message: 'Reset token expired' });
}

if (!user.reset_token_expires || isNaN(expires.getTime())) {
  return res.status(400).json({ message: 'Invalid expiry date' });
}
console.log("NOW:", new Date().toISOString());
console.log("EXPIRES:", user.reset_token_expires);

    const hashedPassword = await hashPassword(newPassword);

    await User.updatePasswordAndClearResetToken(user.id, hashedPassword);
console.log("NOW:", new Date().toISOString());
console.log("EXPIRES RAW:", user.reset_token_expires);
console.log("EXPIRES PARSED:", new Date(user.reset_token_expires).toISOString());
    return res.status(200).json({
      message: 'Password reset successfully'
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || 'Reset password failed'
    });
  }
};