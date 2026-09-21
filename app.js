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

app.get('/', (req, res) => {
  res.render('products/index');
});

app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.user = req.session ? req.session.user : null;
  res.locals.wishlistItems = (req.session && req.session.wishlist) ? req.session.wishlist : [];
  res.locals.cartItems = (req.session && req.session.cart) ? req.session.cart : [];
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isLoggedIn = !!req.session.user;

  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  next();
});
app.post('/add-to-cart', (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  req.session.cart.push(productId);
  res.redirect('back'); 
});

app.get('/brands', (req, res) => {
  res.render('brands'); 
});

app.get('/blog', (req, res) => {
  res.render('blog');
});

  
app.get('/brands/:slug', (req, res) => {
  const brandSlug = req.params.slug; 
  res.render('./products/brand-detail', { 
    brandSlug: brandSlug 
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));