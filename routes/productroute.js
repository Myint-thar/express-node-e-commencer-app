const express = require('express');
const router = express.Router();

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

router.get('/category/:name', async (req, res) => {
  const categoryName = req.params.name;
  const categories = getCategoriesData();
  const products = getProductsData().filter(p => p.category.toLowerCase() === categoryName.toLowerCase());

  res.render('products/index', { 
    pageTitle: `Category: ${categoryName.toUpperCase()}`,
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

router.get('/best-sellers', async (req, res) => {
  const categories = getCategoriesData();
  const products = getProductsData().filter(p => p.badge === 'BEST SELLER');

  res.render('products/index', { 
    pageTitle: 'Best Sellers',
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

router.get('/new-arrivals', async (req, res) => {
  const categories = getCategoriesData();
  const products = getProductsData().filter(p => p.badge === 'NEW');

  res.render('products/index', { 
    pageTitle: 'New Arrivals',
    categories, 
    products, 
    wishlistItems: req.session?.wishlist || [], 
    cartItems: req.session?.cart || [] 
  });
});

function getCategoriesData() {
  return [
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { name: 'Beauty & Care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200' },
    { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' }
  ];
}

//item 20
function getProductsData() {
  return [
    { _id: '1', title: 'Wireless Over-Ear Headphones', price: 49.99, oldPrice: 79.99, badge: 'BEST SELLER', category: 'electronics', color: 'Black', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', description: 'High-quality wireless headphones with noise cancellation.' },
    { _id: '2', title: 'Smart Watch Series X', price: 39.99, oldPrice: 59.99, badge: 'SAVE 25%', category: 'electronics', color: 'Black', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', description: 'Track your fitness, heart rate, and notifications on the go.' },
    { _id: '3', title: 'Aroma Diffuser Humidifier', price: 24.99, oldPrice: 39.99, badge: 'NEW', category: 'beauty', color: 'White', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', description: 'Create a relaxing atmosphere with this quiet aroma diffuser.' },
    { _id: '4', title: 'Classic Urban Backpack', price: 44.99, oldPrice: 59.99, badge: 'SAVE 30%', category: 'fashion', color: 'Blue', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', description: 'Durable and spacious backpack for everyday urban travel.' },
    { _id: '5', title: 'Bluetooth Mechanical Keyboard', price: 69.99, badge: 'TRENDING', category: 'electronics', color: 'White', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400', description: 'Tactile mechanical switches for the best typing experience.' },
    { _id: '6', title: 'Minimalist Desk Lamp', price: 29.99, category: 'Home & Living', color: 'Black', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', description: 'Sleek desk lamp with adjustable brightness levels.' },
    { _id: '7', title: 'Luxury Men Perfume', price: 55.00, oldPrice: 70.00, category: 'beauty', color: 'Black', image: 'https://images.unsplash.com/photo-1523293115678-d2902f43c3f0?w=400', description: 'Long-lasting signature fragrance for men.' },
    { _id: '8', title: 'Yoga Mat Non-Slip', price: 19.99, category: 'Fitness', color: 'Blue', image: 'https://images.unsplash.com/photo-1601122467364-f6b95b4528c3?w=400', description: 'Premium non-slip yoga mat for your daily workouts.' },
    { _id: '9', title: 'Running Sneakers Pro', price: 89.99, badge: 'NEW', category: 'fashion', color: 'White', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', description: 'Lightweight and comfortable running shoes.' },
    { _id: '10', title: 'Gaming Mouse RGB', price: 34.99, category: 'electronics', color: 'Black', image: 'https://images.unsplash.com/photo-1527814050087-17799b794121?w=400', description: 'High precision gaming mouse with customizable RGB lights.' },
    { _id: '11', title: 'Skincare Face Serum', price: 22.50, category: 'beauty', color: 'White', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', description: 'Rejuvenate your skin with our organic face serum.' },
    { _id: '12', title: 'Wireless Charging Pad', price: 15.99, category: 'electronics', color: 'White', image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400', description: 'Fast wireless charging for all Qi-enabled devices.' },
    { _id: '13', title: 'Casual Cotton T-Shirt', price: 12.99, category: 'fashion', color: 'Blue', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', description: '100% Cotton soft t-shirt for daily wear.' },
    { _id: '14', title: 'Dumbbell Set 10kg', price: 45.00, category: 'Fitness', color: 'Black', image: 'https://images.unsplash.com/photo-1638531518290-db05e5d312bc?w=400', description: 'Adjustable dumbbell set for home gym.' },
    { _id: '15', title: 'Polarized Sunglasses', price: 25.00, category: 'fashion', color: 'Black', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', description: 'Stylish UV400 polarized sunglasses.' },
    { _id: '16', title: 'Ceramic Coffee Mug', price: 9.99, category: 'Home & Living', color: 'White', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', description: 'Classic minimalist ceramic mug.' },
    { _id: '17', title: 'Leather Wallet', price: 28.00, category: 'fashion', color: 'Black', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', description: 'Genuine leather slim wallet with RFID blocking.' },
    { _id: '18', title: 'Bluetooth Speaker Mini', price: 18.99, category: 'electronics', color: 'Blue', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', description: 'Portable waterproof bluetooth speaker.' },
    { _id: '19', title: 'Fitness Jump Rope', price: 8.99, category: 'Fitness', color: 'Black', image: 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?w=400', description: 'Adjustable speed jump rope for cardio.' },
    { _id: '20', title: 'Hair Dryer Pro', price: 55.00, oldPrice: 85.00, category: 'beauty', color: 'White', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', description: 'Ionic hair dryer for fast and safe drying.' }
  ];
  
}

module.exports = router;