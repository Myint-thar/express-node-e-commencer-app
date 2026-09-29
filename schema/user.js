const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: {
      isEmail: true,
      isGmail(value) {
        if (!value.toLowerCase().endsWith('@gmail.com')) {
          throw new Error('Only @gmail.com addresses are allowed.');
        }
      }
    }
  },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  role: { type: DataTypes.ENUM('USER', 'ADMIN'), defaultValue: 'USER' }
}, { timestamps: true });

module.exports = User;