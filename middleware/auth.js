module.exports = {
  requireAuth: (req, res, next) => {
    if (req.session && req.session.userId) {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      return next();
    }
    return res.redirect('/login');
  },
  forwardAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return res.redirect('/');
    }
    return next();
  },
  requireAdmin: (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'ADMIN') {
      return next();
    }
    return res.status(403).send('Forbidden: Admins Only');
  }
};