const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorProfile = sequelize.define(
  'DoctorProfile',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'years_of_experience',
    },
  },
  {
    tableName: 'doctor_profiles',
    timestamps: false,
  }
);

module.exports = DoctorProfile;
