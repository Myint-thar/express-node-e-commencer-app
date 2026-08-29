const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  badge: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Comics သီးသန့် Columns
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown Author'
  },
  genre: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  totalPages: {
    type: DataTypes.INTEGER,
    defaultValue: 200
  },
  // Electronics သီးသန့် Columns
  brand: {
    type: DataTypes.STRING,
    defaultValue: 'Generic'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: 'Standard Black'
  },
  warranty: {
    type: DataTypes.STRING,
    defaultValue: '1 Year Warranty'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.8
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;