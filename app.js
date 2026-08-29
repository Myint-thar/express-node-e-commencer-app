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

// GLOBAL MIDDLEWARES (res.locals Setup)
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.user = req.session ? req.session.user : null;
  res.locals.wishlistItems = (req.session && req.session.wishlist) ? req.session.wishlist : [];
  res.locals.cartItems = (req.session && req.session.cart) ? req.session.cart : [];
  next();
});

// STATIC PAGES
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/faq', (req, res) => res.render('faq'));

// CART & WISHLIST HANDLERS
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

// CATEGORY ROUTES (CONNECTED TO MYSQL DATABASE)

// 1. Electronics Category Page (သန့်ရှင်းပြီးသား Route တစ်ခုတည်း)
app.get('/products/category/electronics', async (req, res) => {
  try {
    let electronics = await Product.findAll({
      where: {
        category: {
          [Op.or]: ['Electronics', 'electronics', 'Tech', 'Gadgets']
        }
      }
    });

    if (electronics.length === 0) electronics = await Product.findAll();

    res.render('electronics', {
      products: electronics,
      electronics: electronics,
      wishlistItems: req.session?.wishlist || [],
      cartItems: req.session?.cart || []
    });
  } catch (error) {
    console.error('Error fetching electronics:', error);
    res.status(500).send('Server Error');
  }
});

// 2. Comics & Manga Category Page
app.get('/products/category/comics-manga', async (req, res) => {
  try {
    let comics = await Product.findAll({
      where: {
        category: {
          [Op.or]: ['Comics & Manga', 'Manga', 'Comics']
        }
      }
    });

    if (comics.length === 0) comics = await Product.findAll();

    res.render('comics&manga', {
      mangaItems: comics,
      products: comics,
      comics: comics,
      wishlistItems: req.session?.wishlist || [],
      cartItems: req.session?.cart || []
    });
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Server Error');
  }
});

// ELECTRONICS DETAIL ROUTE
app.get('/products/category/electronics', async (req, res) => {
  try {
    const electronics = await Product.findAll({
      where: {
        category: {
          [Op.or]: ['Electronics', 'electronics', 'Tech', 'Gadgets']
        }
      }
    });

    res.render('electronics', {
      electronicsItems: electronics, // View ထဲသို့ Data ပို့ပေးခြင်း
      products: electronics,
      wishlistItems: req.session?.wishlist || [],
      cartItems: req.session?.cart || []
    });
  } catch (error) {
    console.error('Error fetching electronics:', error);
    res.status(500).send('Server Error');
  }
});

// PROMOTION & USER AUTH ROUTES
app.get('/promotion', async (req, res) => {
  try {
    const promoItems = await Product.findAll({ limit: 15 });
    res.render('promotion', {
      promoItems,
      user: req.session?.user || null
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});


app.post('/contact/send', (req, res) => {
  const { name, contact, message } = req.body;
  console.log(`New Message from ${name} (${contact}): ${message}`);
  res.redirect('/?msg=contact_sent');
});

// MANGA DETAIL, READER & E-SLIP ROUTES
app.get('/manga/detail/:id', async (req, res) => {
  try {
    const mangaId = req.params.id;
    const manga = await Product.findByPk(mangaId) || {
      id: mangaId,
      title: `Manga Volume (${mangaId})`,
      author: "Eiichiro Oda",
      genre: "Action / Adventure / Fantasy",
      price: "9.99",
      cover: `https://picsum.photos/seed/manga${mangaId}/400/600`,
      description: "An epic adventure manga following the journey of brave heroes across strange lands."
    };
    res.render('manga-detail', { manga });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get('/manga/read/:id', async (req, res) => {
  try {
    const mangaId = req.params.id;
    const pages = [
      `https://picsum.photos/seed/manga-p1-${mangaId}/700/1000`,
      `https://picsum.photos/seed/manga-p2-${mangaId}/700/1000`,
      `https://picsum.photos/seed/manga-p3-${mangaId}/700/1000`
    ];

    const dbManga = await Product.findByPk(mangaId);

    const manga = {
      id: mangaId,
      title: dbManga ? dbManga.title : `Manga Volume (${mangaId})`,
      category: "Comics & Manga",
      price: dbManga ? dbManga.price : "9.99",
      image: pages[0],
      description: "Enjoy reading high quality manga and comics."
    };

    res.render('manga-read', { 
      manga,
      mangaId, 
      title: `${manga.title} - Chapter 1`, 
      pages 
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get('/eslip/:id', async (req, res) => {
  try {
    const mangaId = req.params.id;
    const dbManga = await Product.findByPk(mangaId);

    const slipData = {
      slipNo: "FAM-" + Math.floor(100000 + Math.random() * 900000),
      mangaTitle: dbManga ? dbManga.title : `Manga Volume (${mangaId})`,
      price: dbManga ? dbManga.price : "9.99",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: "KPay / WavePay",
      status: "PAID / SUCCESSFUL"
    };
    res.render('eslip', { slip: slipData });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// MAIN HOME ROUTE
app.get('/', async (req, res) => {
  try {
    const electronics = await Product.findAll({
      where: { category: 'Electronics' },
      limit: 10
    });

    const comics = await Product.findAll({
      where: { category: 'Comics & Manga' },
      limit: 10
    });

    res.render('products/index', {
      electronics,
      comics,
      wishlistItems: req.session?.wishlist || [],
      cartItems: req.session?.cart || []
    });
  } catch (error) {
    console.error('Home Page Database Error:', error);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));