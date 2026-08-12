const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_at',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('BOOKED', 'CONFIRMED', 'CHECKED_IN', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
      allowNull: false,
      defaultValue: 'BOOKED',
    },
    fee: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
  },
  {
    tableName: 'appointments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['doctor_id', 'scheduled_at'],
        name: 'unique_doctor_slot'
      }
    ]
  }
);

module.exports = Appointment;
