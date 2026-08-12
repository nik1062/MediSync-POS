const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryBatch = sequelize.define(
  'InventoryBatch',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'batch_number',
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expiry_date',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'inventory_batches',
    timestamps: true,
  }
);

module.exports = InventoryBatch;
