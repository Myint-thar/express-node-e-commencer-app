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
// CART & WISHLIST HANDLERS
// -------------------------------------------------------------

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

app.post('/cart/remove/:id', (req, res) => {
  if (req.session.cart) {
    const removeId = String(req.params.id);
    req.session.cart = req.session.cart.filter(item => String(item.id || item._id) !== removeId);
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=cart_removed` : `${referer}?msg=cart_removed`;
  res.redirect(redirectUrl);
});

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

app.post('/wishlist/remove/:id', (req, res) => {
  if (req.session.wishlist) {
    const removeId = String(req.params.id);
    req.session.wishlist = req.session.wishlist.filter(item => String(item.id || item._id) !== removeId);
  }

  const referer = req.get('referer') || '/products';
  const redirectUrl = referer.includes('?') ? `${referer}&msg=wishlist_removed` : `${referer}?msg=wishlist_removed`;
  res.redirect(redirectUrl);
});

// -------------------------------------------------------------
// CATEGORY ROUTES
// -------------------------------------------------------------

// 1. Electronics Route (Dynamic Route အထက်တွင် သီးသန့်ထားပါ)
app.get('/products/category/electronics', (req, res) => {
  const electronicsTitles = [
    "Wireless Over-Ear Headphones", "Smart Watch Series X", "Gaming Mouse RGB",
    "Mechanical Keyboard", "Bluetooth Portable Speaker", "4K Ultra HD Monitor",
    "Noise Canceling Earbuds", "Wireless Charging Pad", "USB-C Multiport Hub",
    "HD Web Camera 1080p", "Smart Fitness Tracker", "Mini Drone 4K"
  ];

  const electronicsList = Array.from({ length: 120 }, (_, i) => {
    const itemTitle = electronicsTitles[i % electronicsTitles.length];
    const modelNum = Math.floor(i / electronicsTitles.length) + 1;
    return {
      _id: `el-${i + 1}`,
      title: `${itemTitle} Gen ${modelNum}`,
      category: "Electronics",
      price: (29.99 + ((i * 7) % 200)).toFixed(2),
      oldPrice: i % 2 === 0 ? (59.99 + ((i * 5) % 250)).toFixed(2) : null,
      image: `https://picsum.photos/seed/tech${i + 200}/300/300`,
      badge: i % 5 === 0 ? "SALE" : (i % 8 === 0 ? "BEST" : null),
      color: i % 2 === 0 ? "Black" : "Silver",
      description: `High performance ${itemTitle} with latest features.`
    };
  });

  return res.render('electronics', {
    products: electronicsList,
    wishlistItems: req.session?.wishlist || [],
    cartItems: req.session?.cart || []
  });
});

// 2. Dynamic Category Route (Comics & Manga နှင့် အခြား ကဏ္ဍများအတွက်)
app.get('/products/category/:category', (req, res) => {
  const categoryParam = req.params.category.toLowerCase();

  if (categoryParam.includes('comic') || categoryParam.includes('manga')) {
    const mangaTitles = [
      "One Piece", "Naruto Shippuden", "Attack on Titan", "Jujutsu Kaisen",
      "Demon Slayer", "Chainsaw Man", "Bleach", "Dragon Ball Super",
      "My Hero Academia", "Spy x Family", "Tokyo Ghoul", "Berserk",
      "Death Note", "Hunter x Hunter", "Solo Leveling", "Vinland Saga"
    ];

    const comicsList = Array.from({ length: 130 }, (_, i) => {
      const titleName = mangaTitles[i % mangaTitles.length];
      const volNum = Math.floor(i / mangaTitles.length) + 1;
      return {
        _id: `cm-${i + 1}`,
        title: `${titleName} Vol. ${volNum}`,
        category: "Comics & Manga",
        price: (8.99 + (i % 12)).toFixed(2),
        oldPrice: i % 3 === 0 ? (14.99 + (i % 5)).toFixed(2) : null,
        image: `https://picsum.photos/seed/manga${i + 100}/300/420`,
        badge: i % 7 === 0 ? "HOT" : (i % 4 === 0 ? "NEW" : null),
        color: "Paperback",
        description: `${titleName} Volume ${volNum} comic book.`
      };
    });

    return res.render('comics&manga', {
      products: comicsList,
      wishlistItems: req.session?.wishlist || [],
      cartItems: req.session?.cart || []
    });
  }

  // Safe filter check (p.category undefined မဖြစ်စေရန်)
  const filteredProducts = (req.products || []).filter(p =>
    p && p.category && p.category.toLowerCase() === categoryParam
  );

  res.render('products/index', {
    products: filteredProducts,
    wishlistItems: req.session?.wishlist || [],
    cartItems: req.session?.cart || []
  });
});

// Register Routes
app.use('/', homeRoute);
app.use('/products', productRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));