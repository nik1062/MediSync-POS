const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define(
  'InvoiceItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'invoice_id',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'product_id',
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'item_name',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'unit_price',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    tableName: 'invoice_items',
    timestamps: false,
  }
);

module.exports = InvoiceItem;
