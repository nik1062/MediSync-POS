const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashRegisterShift = sequelize.define(
  'CashRegisterShift',
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    openingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'opening_balance',
    },
    closingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'closing_balance',
    },
    expectedClosingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'expected_closing_balance',
    },
    totalCashSales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_cash_sales',
    },
    totalCardSales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_card_sales',
    },
    totalUpiSales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_upi_sales',
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'opened_at',
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'closed_at',
    },
  },
  {
    tableName: 'cash_register_shifts',
    timestamps: true,
  }
);

module.exports = CashRegisterShift;
