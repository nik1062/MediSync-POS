const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    doctorId: { type: DataTypes.UUID, allowNull: false },
    patientId: { type: DataTypes.UUID, allowNull: false },
    careEpisodeId: { type: DataTypes.UUID, allowNull: false, unique: true }, // One review per episode
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true }
  }, {
    timestamps: true
  });
  return Review;
};
