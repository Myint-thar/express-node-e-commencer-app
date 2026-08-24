require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productroute');

const app = express();

// Database Connection
connectDB();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.redirect('/products'));
app.use('/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));