const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Clinic = sequelize.define(
  'Clinic',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_phone'
    },
    operatingHours: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'operating_hours'
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'photo_url'
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
      field: 'subscription_status',
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'subscription_expires_at',
    },
  },
  {
    tableName: 'clinics',
    timestamps: true,
  }
);

module.exports = Clinic;
