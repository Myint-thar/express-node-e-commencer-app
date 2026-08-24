const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Table မရှိသေးပါက auto ဖန်တီးပေးမည်
    console.log('MySQL Database Connected Successfully via Sequelize');
  } catch (err) {
    console.error('MySQL Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };