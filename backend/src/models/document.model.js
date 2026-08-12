const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    familyMemberId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    documentType: { type: DataTypes.ENUM('LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'OTHER'), defaultValue: 'OTHER' },
    fileUrl: { type: DataTypes.TEXT, allowNull: false }, // Use TEXT to support base64 strings if no cloud storage
    uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    timestamps: true
  });
  return Document;
};
