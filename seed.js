const sequelize = require('./config/db'); // မိမိ၏ db path သို့ ပြင်ပါ
const Product = require('./schema/products'); // မိမိ၏ schema path သို့ ပြင်ပါ

// 1. COMICS GENERATOR (120 ITEMS)
const seriesList = [
  { name: 'One Piece', author: 'Eiichiro Oda', genre: 'Action / Adventure' },
  { name: 'Naruto', author: 'Masashi Kishimoto', genre: 'Ninja / Action' },
  { name: 'Attack on Titan', author: 'Hajime Isayama', genre: 'Dark Fantasy' },
  { name: 'Jujutsu Kaisen', author: 'Gege Akutami', genre: 'Action / Supernatural' },
  { name: 'Demon Slayer', author: 'Koyoharu Gotouge', genre: 'Adventure' },
  { name: 'Dragon Ball Super', author: 'Akira Toriyama', genre: 'Martial Arts' },
  { name: 'My Hero Academia', author: 'Kohei Horikoshi', genre: 'Superhero' },
  { name: 'Bleach', author: 'Tite Kubo', genre: 'Action / Fantasy' }
];

const comicsList = [];
let cId = 1;

seriesList.forEach((s) => {
  for (let vol = 1; vol <= 15; vol++) {
    const titleText = `${s.name} Vol.${vol}`;
    comicsList.push({
      title: titleText,
      category: 'Comics & Manga',
      price: parseFloat((8.99 + vol * 0.2).toFixed(2)),
      // သေချာပေါက် ပုံပေါ်မည့် Placeholder Image Link
      image: `https://placehold.co/300x420/1e293b/ffffff?text=${encodeURIComponent(titleText)}`,
      badge: vol === 1 ? 'HOT' : 'NEW',
      author: s.author,
      genre: s.genre,
      totalPages: 180 + vol * 5,
      description: `Official Chapter volume ${vol} of ${s.name}. Read the full story line with high definition manga panels and story content.`
    });
    cId++;
  }
});

// 2. ELECTRONICS GENERATOR (120 ITEMS)
const techBrands = ['Sony', 'Apple', 'Samsung', 'Logitech', 'Razer', 'Asus', 'JBL', 'Anker'];
const techItems = ['Gaming Headset', 'Mechanical Keyboard', '4K Monitor', 'Wireless Mouse', 'Smart Watch', 'Bluetooth Speaker'];

const electronicsList = [];
for (let i = 1; i <= 120; i++) {
  const brand = techBrands[i % techBrands.length];
  const item = techItems[i % techItems.length];
  const titleText = `${brand} ${item} Pro`;

  electronicsList.push({
    title: `${titleText} #${i}`,
    category: 'Electronics',
    price: parseFloat((29.99 + i * 2.5).toFixed(2)),
    image: `https://placehold.co/400x400/0f172a/6366f1?text=${encodeURIComponent(titleText)}`,
    badge: i % 4 === 0 ? 'SALE' : 'NEW',
    brand: brand,
    color: 'Space Black',
    description: `High performance ${brand} ${item}. Built with high quality durability and sleek design.`
  });
}

// 3. EXECUTE SEEDING
const seedDB = async () => {
  try {
    console.log('🔄 Re-syncing DB and Seeding Data...');
    await sequelize.sync({ force: true });
    
    await Product.bulkCreate([...comicsList, ...electronicsList]);
    console.log('✅ SEED COMPLETED SUCCESSFULLY! (240 Items Added)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedDB();