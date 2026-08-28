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
  res.locals.user = req.session ? req.session.user : null;
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
      id: `el-${i + 1}`,
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

app.get('/products/category/comics-manga', (req, res) => {
  const mangaTitles = [
    "One Piece", "Naruto Shippuden", "Attack on Titan", "Jujutsu Kaisen",
    "Demon Slayer", "Chainsaw Man", "Bleach", "Dragon Ball Super",
    "My Hero Academia", "Spy x Family", "Tokyo Ghoul", "Berserk"
  ];

  const authors = [
    "Eiichiro Oda", "Masashi Kishimoto", "Hajime Isayama", "Gege Akutami",
    "Koyoharu Gotouge", "Tatsuki Fujimoto", "Tite Kubo", "Akira Toriyama",
    "Kohei Horikoshi", "Tatsuya Endo", "Sui Ishida", "Kentaro Miura"
  ];

  const comicsList = Array.from({ length: 120 }, (_, i) => {
    const titleIndex = i % mangaTitles.length;
    const titleName = mangaTitles[titleIndex];
    const authorName = authors[titleIndex];
    const volNum = Math.floor(i / mangaTitles.length) + 1;
    const itemId = `cm-${i + 1}`;
    const imgUrl = `https://picsum.photos/seed/manga${i + 100}/300/420`;

    return {
      id: itemId,
      _id: itemId,
      title: `${titleName} Vol. ${volNum}`,
      author: authorName,
      genre: "Action/Manga",
      category: "Comics & Manga",
      price: (8.99 + (i % 12)).toFixed(2),
      oldPrice: i % 3 === 0 ? (14.99 + (i % 5)).toFixed(2) : null,
      cover: imgUrl,
      image: imgUrl,
      badge: i % 7 === 0 ? "HOT" : (i % 4 === 0 ? "NEW" : null),
      color: "Paperback",
      description: `${titleName} Volume ${volNum} comic book.`
    };
  });

  res.render('comics&manga', {
    mangaItems: comicsList,
    products: comicsList,
    wishlistItems: req.session?.wishlist || [],
    cartItems: req.session?.cart || []
  });
});

app.get('/products/category/:category', (req, res) => {
  const categoryParam = req.params.category.toLowerCase();

  const filteredProducts = (req.products || []).filter(p =>
    p && p.category && p.category.toLowerCase() === categoryParam
  );

  res.render('products/index', {
    products: filteredProducts,
    electronics: [],
    comics: [],
    wishlistItems: req.session?.wishlist || [],
    cartItems: req.session?.cart || []
  });
});

// -------------------------------------------------------------
// PROMOTION & USER AUTH ROUTES
// -------------------------------------------------------------

app.get('/promotion', (req, res) => {
  const promoItems = Array.from({ length: 15 }, (_, i) => ({
    _id: `promo-${i + 1}`,
    title: i % 2 === 0 ? `Gaming Headset Pro Gen ${i + 1}` : `One Piece Special Edition Vol. ${i + 1}`,
    category: i % 2 === 0 ? "Electronics" : "Manga",
    price: (19.99 + (i * 5)).toFixed(2),
    oldPrice: (39.99 + (i * 8)).toFixed(2),
    image: `https://picsum.photos/seed/promo${i + 50}/300/300`,
    badge: `${20 + (i * 3)}% OFF`
  }));

  res.render('promotion', {
    promoItems,
    user: req.session?.user || null
  });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@gmail.com" && password === "123456") {
    req.session.user = { name: "Admin", email };
    return res.redirect('/');
  }
  res.render('login', { error: 'Invalid Email or Password!' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/contact/send', (req, res) => {
  const { name, contact, message } = req.body;
  console.log(`New Message from ${name} (${contact}): ${message}`);
  res.redirect('/?msg=contact_sent');
});

// -------------------------------------------------------------
// MAIN HOME ROUTE
// -------------------------------------------------------------

app.get('/', (req, res) => {
  const electronics = Array.from({ length: 10 }, (_, i) => ({
    _id: `el-home-${i + 1}`,
    title: `Smart Tech Device Gen ${i + 1}`,
    category: "Electronics",
    price: (29.99 + (i * 12)).toFixed(2),
    image: `https://picsum.photos/seed/tech${i + 100}/300/300`,
    badge: i % 2 === 0 ? "SALE" : "HOT"
  }));

  const comics = Array.from({ length: 10 }, (_, i) => ({
    _id: `cm-home-${i + 1}`,
    title: i % 2 === 0 ? `One Piece Vol. ${i + 1}` : `Attack on Titan Vol. ${i + 1}`,
    category: "Manga",
    price: (8.99 + (i * 2)).toFixed(2),
    image: `https://picsum.photos/seed/manga${i + 100}/300/300`,
    badge: "POPULAR"
  }));

  res.render('products/index', {
    electronics,
    comics,
    wishlistItems: req.session?.wishlist || [],
    cartItems: req.session?.cart || []
  });
});

// -------------------------------------------------------------
// MANGA DETAIL, READER & E-SLIP ROUTES (NOW UN-NESTED)
// -------------------------------------------------------------

app.get('/manga/detail/:id', (req, res) => {
  const mangaId = req.params.id;
  const manga = {
    id: mangaId,
    title: `Manga Volume (${mangaId})`,
    author: "Eiichiro Oda",
    genre: "Action / Adventure / Fantasy",
    price: "9.99",
    cover: `https://picsum.photos/seed/manga${mangaId}/400/600`,
    description: "An epic adventure manga following the journey of brave heroes across strange lands."
  };
  res.render('manga-detail', { manga });
});

app.get('/manga/read/:id', (req, res) => {
  const mangaId = req.params.id;
  const pages = [
    `https://picsum.photos/seed/manga-p1-${mangaId}/700/1000`,
    `https://picsum.photos/seed/manga-p2-${mangaId}/700/1000`,
    `https://picsum.photos/seed/manga-p3-${mangaId}/700/1000`
  ];
  const manga = {
    id: mangaId,
    title: `Manga Volume (${mangaId})`,
    category: "Comics & Manga",
    price: "9.99",
    image: pages[0],
    description: "Enjoy reading high quality manga and comics."
  };

  res.render('manga-read', { 
    manga,
    mangaId, 
    title: `Manga Volume (${mangaId}) - Chapter 1`, 
    pages 
  });
});

app.get('/eslip/:id', (req, res) => {
  const mangaId = req.params.id;
  const slipData = {
    slipNo: "FAM-" + Math.floor(100000 + Math.random() * 900000),
    mangaTitle: `Manga Volume (${mangaId})`,
    price: "9.99",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: "KPay / WavePay",
    status: "PAID / SUCCESSFUL"
  };
  res.render('eslip', { slip: slipData });

  // Manga Reader Route
app.get('/manga/read/:id', (req, res) => {
  const mangaId = req.params.id;
  // Sample Pages with high quality manga panels
  const pages = [
    `https://picsum.photos/seed/manga-panel-1-${mangaId}/800/1200`,
    `https://picsum.photos/seed/manga-panel-2-${mangaId}/800/1200`,
    `https://picsum.photos/seed/manga-panel-3-${mangaId}/800/1200`
  ];
  
  res.render('manga-read', { 
    mangaId, 
    title: `Manga Volume (${mangaId}) - Chapter 1`, 
    pages 
  });
});

// E-Slip Route
app.get('/eslip/:id', (req, res) => {
  const mangaId = req.params.id;
  const slipData = {
    slipNo: "FAM-" + Math.floor(100000 + Math.random() * 900000),
    mangaTitle: `Manga Volume (${mangaId})`,
    price: "9.99",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: "KPay / WavePay",
    status: "PAID / SUCCESSFUL"
  };
  res.render('eslip', { slip: slipData });
});
// app.js

// Static Pages Routes
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/faq', (req, res) => res.render('faq')); 

app.use('/', homeRoute);
app.use('/products', productRoute);

});

// Register Extra Routes
app.use('/', homeRoute);
app.use('/products', productRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));