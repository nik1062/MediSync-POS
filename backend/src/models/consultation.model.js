const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consultation = sequelize.define(
  'Consultation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'appointment_id',
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
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ended_at',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    soapData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'soap_data',
    },
  },
  {
    tableName: 'consultations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Consultation;
