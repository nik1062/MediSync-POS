const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'clinic_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'selling_price',
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'purchase_price',
    },
    stockCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'stock_count',
    },
    minimumStock: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'minimum_stock',
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'supplier_id',
    },
    scheduleClass: {
      type: DataTypes.ENUM('OTC', 'H', 'H1', 'X'),
      allowNull: true,
      field: 'schedule_class',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
);

module.exports = Product;
