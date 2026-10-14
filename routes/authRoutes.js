const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateGmail, requireGuest, requireAuth } = require('../middleware/authMiddleware');

// View Routes
router.get('/login', requireGuest, authController.renderLogin);
router.get('/register', requireGuest, authController.renderRegister);
router.get('/forgot-password', requireGuest, authController.renderForgotPassword);
router.get('/reset-password', requireGuest, authController.renderResetPassword);

// API Actions
router.post('/api/auth/login', requireGuest, validateGmail, authController.handleLogin);
router.post('/api/auth/register', requireGuest, validateGmail, authController.handleRegister);
router.post('/api/auth/forgot-password', validateGmail, authController.handleForgotPassword);
router.post('/api/auth/reset-password', validateGmail, authController.handleResetPassword);

// Logout
router.post('/logout', requireAuth, authController.handleLogout);

module.exports = router;