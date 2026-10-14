// Validate Strict Gmail Format
const validateGmail = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Gmail address is required.' });
  }

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(email.toLowerCase().trim())) {
    return res.status(400).json({ success: false, message: 'Only valid @gmail.com addresses are accepted.' });
  }
  next();
};

// Require Logged-In Auth
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    return res.redirect('/login');
  }
  next();
};

// Require Guest (Not Logged In)
const requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// Require Role (e.g. "admin" or "user")
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    if (req.session.role !== role) {
      return res.status(403).send('403 Forbidden: Access Denied');
    }
    next();
  };
};

// Prevent Cache (Prevents viewing protected pages via browser Back button after logout)
const preventCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

module.exports = {
  validateGmail,
  requireAuth,
  requireGuest,
  requireRole,
  preventCache
};