require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const bcrypt = require('bcrypt'); // Password Hashing အတွက် ထည့်သွင်းထားပါသည်

// Database & Model Imports
const sequelize = require('./config/db');
const Product = require('./schema/products');
const User = require('./schema/user');
require('./models/EmailVerification');

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

// GLOBAL MIDDLEWARE (Auth State)
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
    } catch (err) {
      res.locals.currentUser = null;
      res.locals.isLoggedIn = false;
    }
  } else {
    res.locals.currentUser = null;
    res.locals.isLoggedIn = false;
  }
  next();
});

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES (FIXED DB INTEGRATION)
// -------------------------------------------------------------

// Render Auth Page
app.get('/', (req, res) => {
    // layout: false ထည့်ထား၍ Navbar ဟောင်း ပါမလာတော့ပါ
    res.render('auth-l', { layout: false }); 
});

// API: Sign In (Check DB & Verify Password)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "အချက်အလက်များ အပြည့်အစုံ ဖြည့်စွက်ပါ" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။" });
    }

    // Assign userId to Session correctly
    req.session.userId = user.id;
    req.session.isLoggedIn = true;

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။" });
  }
});

// API: Send OTP (Sign Up)
app.post('/api/auth/send-otp', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "အချက်အလက်များ အပြည့်အစုံ ဖြည့်စွက်ပါ" });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "ဤ အီးမေးလ်ဖြင့် အကောင့်ပြုလုပ်ပြီးသား ဖြစ်နေပါသည်။" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.tempUser = { name, email, password, otp };

  console.log(`[OTP Sent to ${email}]: ${otp}`);
  return res.json({ success: true });
});

// API: Verify OTP & Complete Registration (Save User to DB)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const temp = req.session.tempUser;

    if (temp && temp.email === email && temp.otp === otp) {
      if (temp.isReset) {
        delete req.session.tempUser;
        return res.json({ success: true });
      }

      // Hash Password & Save User to MySQL Database
      const hashedPassword = await bcrypt.hash(temp.password, 10);
      const newUser = await User.create({
        name: temp.name,
        email: temp.email,
        password_hash: hashedPassword
      });

      // Set Session
      req.session.userId = newUser.id;
      req.session.isLoggedIn = true;
      delete req.session.tempUser;

      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, message: "OTP လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "အကောင့်ဖွင့်ရာတွင် အမှားအယွင်းရှိနေပါသည်။" });
  }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));