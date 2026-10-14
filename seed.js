const { Sequelize } = require('sequelize');
const sequelize = require('./config/db');
require('dotenv').config();

const seedDB = async () => {
  try {
    console.log('🔄 Checking and creating database...');

    const tempSeq = new Sequelize(
      '', 
      process.env.DB_USER || 'root', 
      process.env.DB_PASSWORD || '', 
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
      }
    );

    const dbName = process.env.DB_NAME || 'ecommerce_db';
    await tempSeq.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempSeq.close();
    console.log(`✅ Database '${dbName}' is ready!`);

    const sequelize = require('./config/db');
    const Product = require('./schema/products');

    console.log('🔄 Re-syncing Tables...');
    await sequelize.sync({ force: true });

    // TECH & ELECTRONICS GENERATOR (240 ITEMS WITH CATEGORIES)
    const techBrands = ['Sony', 'Apple', 'Samsung', 'Logitech', 'Razer', 'Asus', 'JBL', 'Anker', 'Dell', 'HP', 'MSI', 'Corsair'];
    const techItems = ['Gaming Headset', 'Mechanical Keyboard', '4K Monitor', 'Wireless Mouse', 'Smart Watch', 'Bluetooth Speaker', 'Gaming Laptop', 'Graphics Card', 'Webcam', 'Microphone'];
    const categories = ['For Home', 'For Music', 'For Phone', 'For Storage'];
    
    const electronicsList = [];
    for (let i = 1; i <= 240; i++) {
      const brand = techBrands[i % techBrands.length];
      const item = techItems[i % techItems.length];
      const category = categories[i % categories.length];
      const titleText = `${brand} ${item} Pro`;

      electronicsList.push({
        name: `${titleText} #${i}`,
        slug: `${brand.toLowerCase()}-${item.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        brand: brand,
        category: category,
        price: parseFloat((29.99 + i * 2.5).toFixed(2)),
        image_url: `https://placehold.co/400x400/0f172a/6366f1?text=${encodeURIComponent(titleText)}`,
        description: `High performance ${brand} ${item}. Built with high quality durability.`
      });
    }

    console.log('📥 Inserting Tech Seed Data...');
    await Product.bulkCreate(electronicsList);
    console.log('✅ SEED COMPLETED SUCCESSFULLY! (240 Tech Items Added)');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

seedDB();