module.exports = {
  // Logged in ဖြစ်မှ ဝင်ခွင့်ပေးမည် (Dashboard, Settings, etc)
  requireAuth: (req, res, next) => {
    if (req.session && req.session.userId) {
      // Browser Back Button ဖြင့် Logout ပြီးနောက် ပြန်ဝင်ခြင်းကို တားဆီးရန်
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      return next();
    }
    return res.redirect('/login');
  },

  // Logged in ဖြစ်ပြီးသားသူများကို Login/Signup Page သို့ ထပ်မသွားစေရန်
  forwardAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return res.redirect('/');
    }
    return next();
  },

  // Admin သာ ဝင်ခွင့်ရှိမည်
  requireAdmin: (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'ADMIN') {
      return next();
    }
    return res.status(403).send('Forbidden: Admins Only');
  }
};