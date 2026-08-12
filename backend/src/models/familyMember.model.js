const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FamilyMember = sequelize.define('FamilyMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    primaryUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    relationship: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. 'Son', 'Daughter', 'Spouse', 'Parent'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    timestamps: true,
  });

  return FamilyMember;
};
