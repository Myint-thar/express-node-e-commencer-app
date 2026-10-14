require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Database & Model Imports
const sequelize = require('./config/db');
const Product = require('./schema/products');
const User = require('./schema/user');

const app = express();

// DATABASE CONNECTION & SYNC
sequelize.sync({ alter: true })
  .then(() => console.log('MySQL Database Connected & Synced!'))
  .catch((err) => console.error('Database sync error:', err));

// VIEW ENGINE & STATIC SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SESSION SETUP
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secure_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 Day
  }
}));

sessionStore.sync();

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    return res.redirect('/login');
  }
  next();
};

const requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
};

const preventCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

// GLOBAL MIDDLEWARE (Set locals for views)
app.use(async (req, res, next) => {
  const pathSegment = req.path.split('/')[1];
  res.locals.activePage = pathSegment || 'home';

  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId, { 
        attributes: { exclude: ['password_hash'] } 
      });
      res.locals.currentUser = user ? user.toJSON() : null;
      res.locals.isLoggedIn = !!user;
      res.locals.isAdmin = user?.role === 'admin';
    } catch (err) {
      res.locals.currentUser = null;
      res.locals.isLoggedIn = false;
      res.locals.isAdmin = false;
    }
  } else {
    res.locals.currentUser = null;
    res.locals.isLoggedIn = false;
    res.locals.isAdmin = false;
  }
  next();
});

// Root Route
app.get('/', (req, res) => {
    if (req.session?.userId) {
        return res.redirect('/products');
    }
    return res.render('auth-l', { layout: false });
});

// Auth Pages
app.get('/login', requireGuest, (req, res) => res.render('auth/login', { layout: false }));
app.get('/register', requireGuest, (req, res) => res.render('auth/signup', { layout: false }));

// Logout Route
app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// API: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: "Your account has been suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    req.session.userId = user.id;
    req.session.role = user.role || 'user';
    req.session.isLoggedIn = true;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Failed to save session. Please try again." });
      }
      return res.json({ success: true, redirect: '/' });
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
});

// API: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: cleanEmail,
      password_hash: hashedPassword,
      role: 'user',
      status: 'active',
      email_verified: true
    });

    req.session.userId = user.id;
    req.session.role = user.role || 'user';
    req.session.isLoggedIn = true;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Failed to save session. Please try again." });
      }
      return res.json({ success: true, redirect: '/' });
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
});

app.get('/products', async (req, res) => {
  try {
    const { search, category, page = 1 } = req.query;
    const limit = 6;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    // Sidebar Category ဖြင့် စစ်ထုတ်ခြင်း
    if (category && category !== 'All Product') {
      whereCondition.category = category;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['id', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.render('products/index', {
      products,
      currentPage: parseInt(page),
      totalPages,
      currentCategory: category || 'All Product',
      searchQuery: search || ''
    });

  } catch (err) {
    console.error("Products filter error:", err);
    return res.render('products/index', {
      products: [],
      currentPage: 1,
      totalPages: 1,
      currentCategory: 'All Product',
      searchQuery: ''
    });
  }
});

// Brands Page
app.get('/brands', (req, res) => res.render('brands'));

// Brand Detail Route
app.get('/brand-detail', async (req, res) => {
    try {
        const selectedBrand = req.query.brand || 'Apple';

        const products = await Product.findAll({
            where: {
                brand: {
                    [Op.like]: selectedBrand
                }
            },
            order: [['id', 'DESC']]
        });

        return res.render('products/brand-detail', {
            brandName: selectedBrand,
            products: products || []
        });

    } catch (err) {
        console.error("Database Query Error:", err);
        return res.render('products/brand-detail', {
            brandName: req.query.brand || 'Unknown',
            products: []
        });
    }
});

// Blog & Tech Hub Routes
app.get('/tech-hub', (req, res) => res.redirect('/blog'));

app.get('/blog', (req, res) => {
  const articles = [
    {
      title: "Building Scalable REST APIs with Express and Node.js",
      category: "Backend",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500",
      description: "Learn best practices for structuring Express routers, handling ORM queries, and managing middleware efficiently.",
      date: "Oct 8, 2026",
      readTime: "6 min read",
      slug: "building-scalable-rest-apis"
    },
    {
      title: "Database Optimization Strategies for MySQL & PostgreSQL",
      category: "Database",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500",
      description: "Explore indexing techniques, query execution plans, and how to prevent N+1 query problems in modern web apps.",
      date: "Oct 6, 2026",
      readTime: "4 min read",
      slug: "database-optimization-strategies"
    },
    {
      title: "Mastering Real-Time Features with WebSockets",
      category: "WebDev",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
      description: "A practical guide to implementing real-time event streaming and live messaging in full-stack applications.",
      date: "Oct 2, 2026",
      readTime: "5 min read",
      slug: "mastering-realtime-websockets"
    }
  ];

  return res.render('blog', { articles });
});

// Protected User Routes
app.get('/profile', requireAuth, (req, res) => res.render('user/dashboard'));
app.get('/dashboard', requireAuth, (req, res) => res.render('user/dashboard'));
app.get('/cart', requireAuth, (req, res) => res.render('user/cart'));
app.get('/orders', requireAuth, (req, res) => res.render('user/orders'));
app.get('/checkout', requireAuth, (req, res) => res.render('checkout'));

// 404 Catch-All Route
app.use((req, res) => {
    res.redirect('/');
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tech Hub Server running on http://localhost:${PORT}`));