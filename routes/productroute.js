const express = require('express');
const router = express.Router();

// 1. Home / All Products Route
router.get('/', async (req, res) => {
  const categories = getCategoriesData();
  const products = getProductsData();
  
  res.render('products/index', { 
    pageTitle: 'All Products',
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

// 2. Category Route (Electronics, Fashion, Beauty & Care)
router.get('/category/:name', async (req, res) => {
  const categoryName = req.params.name; // 'electronics', 'fashion', 'beauty'
  const categories = getCategoriesData();
  
  // Database သုံးပါက: const products = await Product.find({ category: categoryName });
  const products = getProductsData().filter(p => p.category.toLowerCase() === categoryName.toLowerCase());

  res.render('products/index', { 
    pageTitle: `Category: ${categoryName.toUpperCase()}`,
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

// 3. Best Sellers Route
router.get('/best-sellers', async (req, res) => {
  const categories = getCategoriesData();
  // Best seller ရွေးထုတ်ခြင်း
  const products = getProductsData().filter(p => p.badge === 'BEST SELLER');

  res.render('products/index', { 
    pageTitle: 'Best Sellers',
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

// 4. New Arrivals Route
router.get('/new-arrivals', async (req, res) => {
  const categories = getCategoriesData();
  // New arrivals ရွေးထုတ်ခြင်း
  const products = getProductsData().filter(p => p.badge === 'NEW');

  res.render('products/index', { 
    pageTitle: 'New Arrivals',
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

// Helper Dummy Data Functions (Database ချိတ်ပါက DB Query ဖြင့် အစားထိုးနိုင်သည်)
function getCategoriesData() {
  return [
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { name: 'Beauty & Care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200' },
    { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' }
  ];
}

function getProductsData() {
  return [
    { _id: '1', title: 'Wireless Over-Ear Headphones', price: 49.99, oldPrice: 79.99, badge: 'BEST SELLER', category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { _id: '2', title: 'Smart Watch Series X', price: 39.99, oldPrice: 59.99, badge: 'SAVE 25%', category: 'electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    { _id: '3', title: 'Aroma Diffuser Humidifier', price: 24.99, oldPrice: 39.99, badge: 'NEW', category: 'beauty', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400' },
    { _id: '4', title: 'Classic Urban Backpack', price: 44.99, oldPrice: 59.99, badge: 'SAVE 30%', category: 'fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' }
  ];
}

module.exports = router;