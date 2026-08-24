const express = require('express');
const router = express.Router();

// Get Product Homepage
router.get('/', async (req, res) => {
  try {
    // Database မှ dynamic ယူလိုပါက Product.find() စသည်ဖြင့် သုံးနိုင်ပါသည်။
    const categories = [
      { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
      { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
      { name: 'Beauty & Care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200' },
      { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200' },
      { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' }
    ];

    const products = [
      { _id: '1', title: 'Wireless Over-Ear Headphones', price: 49.99, oldPrice: 79.99, badge: 'BEST SELLER', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { _id: '2', title: 'Smart Watch Series X', price: 39.99, oldPrice: 59.99, badge: 'SAVE 25%', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { _id: '3', title: 'Aroma Diffuser Humidifier', price: 24.99, oldPrice: 39.99, badge: 'NEW', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400' },
      { _id: '4', title: 'Classic Urban Backpack', price: 44.99, oldPrice: 59.99, badge: 'SAVE 30%', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' }
    ];

    // Dummy Wishlist/Cart (Session သို့မဟုတ် Database မှ ရယူနိုင်သည်)
    const wishlistItems = req.session?.wishlist || [];
    const cartItems = req.session?.cart || [];

    res.render('products/index', { 
      categories, 
      products, 
      wishlistItems, 
      cartItems 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;