const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovement = sequelize.define(
  'StockMovement',
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    type: {
      type: DataTypes.ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'EXPIRED'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'previous_stock',
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'new_stock',
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reference_type',
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reference_id',
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'performed_by',
    },
  },
  {
    tableName: 'stock_movements',
    timestamps: true,
  }
);

module.exports = StockMovement;
