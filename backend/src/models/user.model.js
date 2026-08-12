const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('PATIENT', 'DOCTOR'),
      allowNull: false,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'clinic_id',
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
  }
);

module.exports = User;
