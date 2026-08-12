const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CareEpisode = sequelize.define(
  'CareEpisode',
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
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'booking_id',
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'consultation_id',
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'prescription_id',
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'invoice_id',
    },
    status: {
      type: DataTypes.ENUM('BOOKED', 'IN_CONSULTATION', 'PRESCRIBED', 'BILLING', 'COMPLETED', 'CANCELLED', 'IN_PERSON_URGENT'),
      allowNull: false,
      defaultValue: 'BOOKED',
    },
    urgencyLevel: {
      type: DataTypes.ENUM('ROUTINE', 'URGENT', 'EMERGENCY'),
      allowNull: false,
      defaultValue: 'ROUTINE',
      field: 'urgency_level',
    },
  },
  {
    tableName: 'care_episodes',
    timestamps: true,
  }
);

module.exports = CareEpisode;
