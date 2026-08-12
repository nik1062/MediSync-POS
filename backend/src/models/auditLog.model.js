const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
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
    action: {
      type: DataTypes.ENUM('DISPENSED_CONTROLLED', 'VOIDED_INVOICE', 'STOCK_ADJUSTMENT'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'entity_id',
    },
    details: {
      type: DataTypes.TEXT, // using TEXT for sqlite compat, JSON is parsed manually if needed
      allowNull: true,
      get() {
        const raw = this.getDataValue('details');
        try { return raw ? JSON.parse(raw) : null; } catch { return raw; }
      },
      set(val) {
        this.setDataValue('details', typeof val === 'object' ? JSON.stringify(val) : val);
      }
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
  }
);

module.exports = AuditLog;
