const Product = require('../models/product'); 

exports.getHomePage = async (req, res) => {
  try {
    const products = await Product.findAll ? await Product.findAll({ limit: 8 }) : [];
    
    // E-commerce Categories
    const categories = [
      { id: 1, name: 'Comics & Manga', icon: '📚', count: '120+ Items' },
      { id: 2, name: 'Electronics', icon: '🎧', count: '85+ Items' },
      { id: 3, name: 'Fashion & Apparel', icon: '👕', count: '200+ Items' },
      { id: 4, name: 'Gaming Gear', icon: '🎮', count: '50+ Items' },
      { id: 5, name: 'Collectibles', icon: '🧸', count: '40+ Items' }
    ];

    res.render('home', {
      title: 'FAMSWORLD - Home & Store',
      categories,
      products,
      flashSaleProducts: products.slice(0, 4)
    });
  } catch (error) {
    console.error('Home Page Error:', error);
    res.status(500).render('error', { message: 'Server Error' });
  }
};