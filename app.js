const express = require('express');
const session = require('express-session'); 
const path = require('path');
const app = express();

// View Engine & Static Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Setup
app.use(session({
  secret: 'famsworld_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Global Middlewares (res.locals Setup)
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.wishlistItems = (req.session && req.session.wishlist) ? req.session.wishlist : [];
  res.locals.cartItems = (req.session && req.session.cart) ? req.session.cart : [];
  next();
});

// Routes Import
const homeRoute = require('./routes/homeroute');
const productRoute = require('./routes/productroute');

// Static Pages
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));

// -------------------------------------------------------------
// CART & WISHLIST HANDLERS (Duplicate Routes ရှင်းလင်းပြီး)
// -------------------------------------------------------------

// 1. Add to Cart
app.post('/cart/add/:id', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const pId = String(req.params.id);
  
  const existingItem = req.session.cart.find(item => String(item.id || item._id) === pId);
  if (existingItem) {
    existingItem.qty = (existingItem.qty || 1) + 1;
  } else {
    req.session.cart.push({
      id: pId,
      _id: pId,
      title: req.body.title || 'Product Item',
      price: req.body.price || 39.99,
      image: req.body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      qty: 1
    });
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=cart_added` : `${referer}?msg=cart_added`;
  res.redirect(redirectUrl);
});

// 2. Remove from Cart
app.post('/cart/remove/:id', (req, res) => {
  if (req.session.cart) {
    const removeId = String(req.params.id);
    req.session.cart = req.session.cart.filter(item => String(item.id || item._id) !== removeId);
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=cart_removed` : `${referer}?msg=cart_removed`;
  res.redirect(redirectUrl);
});

// 3. Add to Wishlist
app.post('/wishlist/add/:id', (req, res) => {
  if (!req.session.wishlist) req.session.wishlist = [];
  const pId = String(req.params.id);

  const exists = req.session.wishlist.some(item => String(item.id || item._id) === pId);
  if (!exists) {
    req.session.wishlist.push({
      id: pId,
      _id: pId,
      title: req.body.title || 'Favorite Item',
      price: req.body.price || 49.99,
      image: req.body.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
    });
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=wishlist_added` : `${referer}?msg=wishlist_added`;
  res.redirect(redirectUrl);
});

// 4. Remove from Wishlist
app.post('/wishlist/remove/:id', (req, res) => {
  if (req.session.wishlist) {
    const removeId = String(req.params.id);
    req.session.wishlist = req.session.wishlist.filter(item => String(item.id || item._id) !== removeId);
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=wishlist_removed` : `${referer}?msg=wishlist_removed`;
  res.redirect(redirectUrl);
});

// Register Routes
app.use('/', homeRoute);
app.use('/products', productRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));