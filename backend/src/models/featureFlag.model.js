const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeatureFlag = sequelize.define('FeatureFlag', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  plan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['FREE', 'STARTER', 'PRO', 'ENTERPRISE']],
    },
  },
  featureKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'feature_flags',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['plan', 'featureKey'] },
  ],
});

module.exports = FeatureFlag;
