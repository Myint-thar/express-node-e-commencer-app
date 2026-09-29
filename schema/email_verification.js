const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const EmailVerification = sequelize.define('EmailVerification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  otp_hash: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  verified_at: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true });

// Relationship
User.hasMany(EmailVerification, { foreignKey: 'user_id' });
EmailVerification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = EmailVerification;