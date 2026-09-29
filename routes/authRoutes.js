const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../schema/user');
const EmailVerification = require('../schema/email_verification');
const { forwardAuthenticated, requireAuth } = require('../middleware/auth');
const otpController = require('../controller/otpController');
const router = express.Router();

// Helper: 6-digit OTP Generate 
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ======================== 1. SIGN UP ========================
router.get('/signup', forwardAuthenticated, (req, res) => res.render('auth/signup', { error: null }));

router.post('/signup', [
  body('email').isEmail().withMessage('Invalid email format')
    .custom(value => {
      if (!value.toLowerCase().endsWith('@gmail.com')) throw new Error('Only @gmail.com is allowed');
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('auth/signup', { error: errors.array()[0].msg });

  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.render('auth/signup', { error: 'Passwords do not match' });

  try {
    let user = await User.findOne({ where: { email } });

    // ၁။ အကောင့်ရှိပြီးသားဖြစ်ပြီး Verified ဖြစ်ပြီးသားဆိုပါက
    if (user && user.email_verified) {
      return res.render('auth/signup', { error: 'Email already registered. Please login.' });
    }

    const salt = await bcrypt.genSalt(10);

    // ၂။ အကောင့် မရှိသေးရင် အသစ်ဆောက်မည်
    if (!user) {
      const password_hash = await bcrypt.hash(password, salt);
      user = await User.create({ name, email, password_hash });
    }

    // ၃။ OTP အသစ်ထုတ်ပေးပြီး Verify Page သို့ ပို့မည် (Unverified သမားများပါ အကျုံးဝင်သည်)
    const otp = generateOTP();
    const otp_hash = await bcrypt.hash(otp, salt);
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await EmailVerification.create({ user_id: user.id, otp_hash, expires_at });

    console.log(`\n========================================`);
    console.log(`[MAIL MOCK] OTP for ${email} is: ${otp}`);
    console.log(`========================================\n`);

    // Session သိမ်းပြီး Verify Page သို့ ပို့မည်
    req.session.verifyEmail = email;
    return res.redirect('/verify-email');

  } catch (err) {
    console.error(err);
    res.render('auth/signup', { error: 'Server error during signup' });
  }
});

// ======================== 2. VERIFY EMAIL ========================
router.get('/verify-email', forwardAuthenticated, (req, res) => {
  if (!req.session.verifyEmail) return res.redirect('/signup');
  res.render('auth/verify', { email: req.session.verifyEmail, error: null });
});

router.post('/verify-email', async (req, res) => {
  const { otp } = req.body;
  const email = req.session.verifyEmail;
  
  if (!email) return res.redirect('/signup');

  try {
    const user = await User.findOne({ where: { email } });
    const verification = await EmailVerification.findOne({ 
      where: { user_id: user.id, verified_at: null },
      order: [['createdAt', 'DESC']]
    });

    if (!verification || verification.expires_at < new Date()) {
      return res.render('auth/verify', { email, error: 'OTP is invalid or expired' });
    }

    const isMatch = await bcrypt.compare(otp, verification.otp_hash);
    if (!isMatch) return res.render('auth/verify', { email, error: 'Incorrect OTP' });

    // Mark as verified
    user.email_verified = true;
    await user.save();
    
    verification.verified_at = new Date();
    await verification.save();

    delete req.session.verifyEmail;
    res.redirect('/login'); // Success!

  } catch (err) {
    res.render('auth/verify', { email, error: 'Server error' });
  }
});

// ======================== 3. LOGIN ========================
router.get('/login', forwardAuthenticated, (req, res) => res.render('auth/login', { error: null }));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    // Generic error (Do not reveal if email exists)
    if (!user) return res.render('auth/login', { error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.render('auth/login', { error: 'Invalid email or password.' });

    // Check Verification Status
    if (!user.email_verified) {
      req.session.verifyEmail = email;
      return res.render('auth/login', { error: 'Please verify your email before signing in. Check your email for OTP.' });
    }

    // Create Authenticated Session
    req.session.userId = user.id;
    req.session.role = user.role;
    
    res.redirect('/'); // Redirect to Home or Dashboard

  } catch (err) {
    res.render('auth/login', { error: 'Server error during login' });
  }
});

// ======================== 4. LOGOUT ========================
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout Error:', err);
    res.clearCookie('connect.sid'); // Clear authentication cookie
    res.redirect('/login');
  });
});

router.post('/api/auth/send-otp', otpController.sendOtp);
router.post('/api/auth/verify-otp', otpController.verifyOtp);
router.post('/api/auth/resend-otp', otpController.resendOtp);

// Render OTP Page
router.get('/verify-email', (req, res) => {
  const email = req.session.verifyEmail || req.query.email || '';
  if (!email) return res.redirect('/signup');
  res.render('auth/verify', { email });
});

module.exports = router;