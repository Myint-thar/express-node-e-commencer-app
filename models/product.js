const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, defaultValue: 'default.jpg' },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Product;