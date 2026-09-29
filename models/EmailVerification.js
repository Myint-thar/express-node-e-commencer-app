const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // သင့်ရဲ့ sequelize connection file path ပြင်ပေးပါ

const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'EmailVerifications',
  timestamps: true, // createdAt, updatedAt ကို အလိုအလျောက် ထည့်ပေးပါမည်
});

module.exports = EmailVerification;