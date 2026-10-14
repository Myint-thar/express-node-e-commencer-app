const bcrypt = require('bcrypt');
const User = require('../schema/user');
const { generateAndSendOtp, verifyOtpCode } = require('../services/otpService');

// 1. Render Authentication Views
exports.renderLogin = (req, res) => res.render('auth/login', { layout: false });
exports.renderRegister = (req, res) => res.render('auth/register', { layout: false });
exports.renderVerifyOtp = (req, res) => {
  const email = req.query.email || '';
  res.render('auth/verify-otp', { email, layout: false });
};
exports.renderForgotPassword = (req, res) => res.render('auth/forgot-password', { layout: false });
exports.renderResetPassword = (req, res) => {
  const email = req.query.email || '';
  res.render('auth/reset-password', { email, layout: false });
};

// 2. Handle Login
exports.handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid Gmail or password.' });
    }

    // Check Account Status
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    if (!user.email_verified || user.status === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your Gmail has not been verified.',
        redirect: `/verify-otp?email=${encodeURIComponent(user.email)}`
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Gmail or password.' });
    }

    // Set Session
    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Session error.' });
      
      const redirectUrl = user.role === 'admin' ? '/admin' : '/';
      return res.json({ success: true, redirect: redirectUrl });
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  }
};

// 3. Handle Register
exports.handleRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ where: { email: cleanEmail } });

    if (existingUser && existingUser.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'An account with this Gmail already exists.' });
    }

    let user = existingUser;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      // Force role = 'user' strictly for public registration
      user = await User.create({
        name,
        email: cleanEmail,
        password_hash: hashedPassword,
        role: 'user',
        status: 'pending',
        email_verified: false
      });
    } else {
      user.name = name;
      user.password_hash = hashedPassword;
      await user.save();
    }

    // Send Gmail OTP
    await generateAndSendOtp(cleanEmail, user.id);

    return res.json({ 
      success: true, 
      message: 'OTP sent to your Gmail.',
      redirect: `/verify-otp?email=${encodeURIComponent(cleanEmail)}`
    });

  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error registering account.' });
  }
};

// 4. Handle Verify OTP
exports.handleVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    await verifyOtpCode(cleanEmail, otp);

    // Update User Status
    const user = await User.findOne({ where: { email: cleanEmail } });
    if (user) {
      user.email_verified = true;
      user.status = 'active';
      await user.save();

      // Auto Login
      req.session.userId = user.id;
      req.session.role = user.role;
    }

    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Session error.' });
      return res.json({ success: true, message: 'Gmail verified successfully!' });
    });

  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'OTP Verification failed.' });
  }
};

// 5. Handle Resend OTP
exports.handleResendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Gmail is required.' });

    const cleanEmail = email.toLowerCase().trim();
    await generateAndSendOtp(cleanEmail);

    return res.json({ success: true, message: 'A new OTP code has been sent to your Gmail.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// 6. Handle Forgot Password (Generic response prevents email enumeration)
exports.handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email: cleanEmail } });
    if (user) {
      await generateAndSendOtp(cleanEmail, user.id);
    }

    return res.json({ 
      success: true, 
      message: 'If an account exists for this Gmail, we have sent a verification code.',
      redirect: `/reset-password?email=${encodeURIComponent(cleanEmail)}`
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// 7. Handle Reset Password
exports.handleResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    await verifyOtpCode(cleanEmail, otp);

    const user = await User.findOne({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// 8. Handle Logout (POST Method)
exports.handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};