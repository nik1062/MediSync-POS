const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consultation_id',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'timestamp',
    updatedAt: false,
  }
);

module.exports = Message;
