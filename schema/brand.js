const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ကိုယ့်ရဲ့ db.js ချိတ်ထားတဲ့ လမ်းကြောင်းအတိုင်း ချိန်ပါ

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  official_website: {
    type: DataTypes.STRING(255)
  },
  logo_url: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'brands',
  timestamps: true,
  createdAt: 'created_at',
  updated_at: 'updated_at'
});

module.exports = Brand;