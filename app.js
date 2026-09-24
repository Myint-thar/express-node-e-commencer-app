require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { Op } = require('sequelize');

// Database & Model Imports
const sequelize = require('./config/db');
const Product = require('./schema/products');

const app = express();

// DATABASE SYNC & CONNECTION
sequelize.sync()
  .then(() => console.log('MySQL Database Connected & Synced with Sequelize!'))
  .catch((err) => console.error('Database Sync Error:', err));

// VIEW ENGINE & STATIC SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SESSION SETUP
app.use(session({
  secret: process.env.SESSION_SECRET || 'famsworld_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// GLOBAL MIDDLEWARES (Locals Setup)
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.user = req.session ? req.session.user : null;
  res.locals.isLoggedIn = !!(req.session && req.session.user);
  res.locals.wishlistItems = (req.session && req.session.wishlist) ? req.session.wishlist : [];
  res.locals.cartItems = (req.session && req.session.cart) ? req.session.cart : [];
  res.locals.cartCount = (req.session && req.session.cart) ? req.session.cart.length : 0;
  next();
});

// -------------------------------------------------------------
// BLOG DATA (Categories & Articles)
// -------------------------------------------------------------
const categoriesMap = {
    'tech-news': { name: 'Tech News', description: 'Stay updated with the latest developments in technology.' },
    'reviews': { name: 'Reviews', description: 'Honest reviews and comparisons of the latest tech products.' },
    'tips-tricks': { name: 'Tips & Tricks', description: 'Useful technology tips to improve your everyday workflow.' },
    'buying-guides': { name: 'Buying Guides', description: 'Helpful guides to choose the right technology products.' },
    'how-to': { name: 'How-To', description: 'Step-by-step tutorials and practical technology guides.' },
    'ai-future-tech': { name: 'AI & Future Tech', description: 'Explore artificial intelligence and emerging technologies.' }
};

const articles = [
    {
        slug: 'future-of-minimalist-tech',
        title: 'The Future of Minimalist Tech',
        category: 'Tips & Tricks',
        categorySlug: 'tips-tricks',
        description: 'Why stripping down digital distractions leads to higher productivity and focus.',
        date: 'Sep 18, 2026',
        readTime: '4 min read',
        author: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
        contentImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&q=80',
        tags: ['Minimalism', 'Productivity', 'DeskSetup']
    },
    {
        slug: 'top-5-headphones-2026',
        title: 'Top 5 Headphones for 2026',
        category: 'Reviews',
        categorySlug: 'reviews',
        description: 'In-depth audiophile test of flagship noise-canceling headphones.',
        date: 'Sep 15, 2026',
        readTime: '7 min read',
        author: 'Sarah Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
        contentImage: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&q=80',
        tags: ['Audio', 'Headphones', 'TechReview']
    },
    {
        slug: 'organize-your-workspace',
        title: 'Organize Your Workspace',
        category: 'How-To',
        categorySlug: 'how-to',
        description: 'Cable management techniques and desk setup essentials for remote engineers.',
        date: 'Sep 12, 2026',
        readTime: '5 min read',
        author: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80',
        contentImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&q=80',
        tags: ['DeskSetup', 'Workspace', 'HowTo']
    }
];

// -------------------------------------------------------------
// EXISTING CORE ROUTES
// -------------------------------------------------------------

// Home Page
app.get('/', (req, res) => {
  res.render('products/index');
});

// Tech Hub Page (Redirects to Home)
app.get('/tech-hub', (req, res) => {
  res.redirect('/');
});

// Add to Cart Route
app.post('/add-to-cart', (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  req.session.cart.push(productId);
  res.redirect('back'); 
});

// Brands Routes
app.get('/brands', (req, res) => {
  res.render('brands'); 
});

app.get('/brands/:slug', (req, res) => {
  const brandSlug = req.params.slug; 
  res.render('./products/brand-detail', { 
    brandSlug: brandSlug 
  });
});

// Checkout Route
app.get('/checkout', (req, res) => {
  res.render('checkout');
});

// -------------------------------------------------------------
// BLOG ROUTES
// -------------------------------------------------------------

// Blog Main Page (/blog)
app.get('/blog', (req, res) => {
  res.render('blog', { articles, categoriesMap });
});

// Dynamic Blog Category & Article Detail Router (/blog/:slug)
app.get('/blog/:slug', (req, res) => {
  const slug = req.params.slug;

  // 1. Check Category
  if (categoriesMap[slug]) {
    const category = categoriesMap[slug];
    const categoryArticles = articles.filter(a => a.categorySlug === slug);
    return res.render('blog-category', { 
      category, 
      categorySlug: slug, 
      articles: categoryArticles, 
      categoriesMap 
    });
  }

  // 2. Check Article Detail
  const article = articles.find(a => a.slug === slug);
  if (article) {
    const relatedArticles = articles.filter(a => a.slug !== slug).slice(0, 3);
    const articleIndex = articles.findIndex(a => a.slug === slug);
    const prevArticle = articles[articleIndex - 1] || null;
    const nextArticle = articles[articleIndex + 1] || null;
    return res.render('blog-detail', { 
      article, 
      relatedArticles, 
      prevArticle, 
      nextArticle 
    });
  }

  res.status(404).send("Page Not Found");
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));