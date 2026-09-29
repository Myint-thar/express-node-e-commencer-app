const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { EmailVerification, User } = require('../models/EmailVerification'); // သင့် Model Structure အတိုင်း ပြင်ပါ
const { sendOTPEmail } = require('../utils/mailer');



// Helper: 6-Digit OTP Generator
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 1. Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Cooldown Check (60 seconds)
    const existingOtp = await EmailVerification.findOne({
      where: { email, verified_at: null },
      order: [['createdAt', 'DESC']],
    });

    if (existingOtp) {
      const secondsSinceLastRequest = Math.floor((new Date() - new Date(existingOtp.createdAt)) / 1000);
      if (secondsSinceLastRequest < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${60 - secondsSinceLastRequest} seconds before requesting a new OTP.`,
        });
      }
    }

    const otp = generateSecureOTP();
    const salt = await bcrypt.genSalt(10);
    const otp_hash = await bcrypt.hash(otp, salt);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 Mins Expiry

    const user = await User.findOne({ where: { email } });

    // Save to Database
    await EmailVerification.create({
      user_id: user ? user.id : null,
      email,
      otp_hash,
      expires_at,
      attempts: 0,
    });

    // Send Email
    await sendOTPEmail(email, otp);

    // Development Logging Only
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);
    }

    return res.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
  }
};

// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const record = await EmailVerification.findOne({
      where: { email, verified_at: null },
      order: [['createdAt', 'DESC']],
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP request found for this email.' });
    }

    // Check Expiration
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Check Max Attempts (Limit 5 attempts)
    if (record.attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Compare Hash
    const isMatch = await bcrypt.compare(otp, record.otp_hash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: `Invalid OTP code. (${5 - record.attempts} attempts left)` });
    }

    // Success State
    record.verified_at = new Date();
    await record.save();

    // Mark User as Verified
    if (record.user_id) {
      await User.update({ email_verified: true }, { where: { id: record.user_id } });
    }

    req.session.verifyEmail = null; // Clear Verification Session

    return res.json({ success: true, message: 'Email verified successfully!' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
};

// 3. Resend OTP
exports.resendOtp = async (req, res) => {
  return exports.sendOtp(req, res);
};