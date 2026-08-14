const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const License = sequelize.define('License', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  clinicId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'clinic_id',
  },
  plan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'FREE',
    validate: {
      isIn: [['FREE', 'STARTER', 'PRO', 'ENTERPRISE']],
    },
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'TRIAL',
    validate: {
      isIn: [['ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED', 'GRACE_PERIOD']],
    },
  },
  trialEnd: {
    type: DataTypes.DATE,
  },
  renewalDate: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'licenses',
});

module.exports = License;
