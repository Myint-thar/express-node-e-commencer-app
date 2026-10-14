// models/brand.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Brand = sequelize.define('Brand', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  logo_url: { type: DataTypes.STRING },
  website_url: { type: DataTypes.STRING },
  founded_year: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('active', 'archived'), defaultValue: 'active' }
});

module.exports = Brand;