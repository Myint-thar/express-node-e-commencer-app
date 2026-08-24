const express = require('express');
const app = express();

// View Engine & Static Setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Global Middlewares (res.locals setup)
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.wishlistItems = (req.session && req.session.wishlist) ? req.session.wishlist : [];
  res.locals.cartItems = (req.session && req.session.cart) ? req.session.cart : [];
  next();
});

// Routes Registration
const homeRoute = require('./routes/homeroute');
const productRoute = require('./routes/productroute');

app.use('/', homeRoute);           // Home Route ကို / တွင် ထားရှိပါသည်
app.use('/products', productRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));