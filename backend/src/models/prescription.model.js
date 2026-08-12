const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define(
  'Prescription',
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
    careEpisodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'care_episode_id',
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consultation_id',
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'patient_id',
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'doctor_id',
    },
    familyMemberId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SIGNED', 'PARTIALLY_DISPENSED', 'DISPENSED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    signedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'signed_at',
    },
    signatureHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'signature_hash',
    },
  },
  {
    tableName: 'prescriptions',
    timestamps: true,
  }
);

module.exports = Prescription;
