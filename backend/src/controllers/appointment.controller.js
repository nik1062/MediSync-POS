const { sequelize, Appointment, Consultation, CareEpisode, User } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, scheduledAt, paymentStatus, fee, familyMemberId, urgencyLevel } = req.body;
  const patientId = req.user.id;

  if (!doctorId || !scheduledAt) {
    return res.status(400).json({ success: false, message: 'doctorId and scheduledAt are required fields.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // Find doctor to get clinicId for the care episode
      const doctor = await User.findByPk(doctorId, { transaction: t });
      if (!doctor || !doctor.clinicId) {
        throw new Error('DOCTOR_NOT_FOUND_OR_NO_CLINIC');
      }

      const appointment = await Appointment.create({
        clinicId: doctor.clinicId,
        patientId,
        doctorId,
        status: 'BOOKED',
        type: urgencyLevel || 'ROUTINE',
        scheduledAt: new Date(scheduledAt),
        fee: fee || 15.00
      }, { transaction: t });

      const careEpisode = await CareEpisode.create({
        clinicId: doctor.clinicId,
        patientId,
        doctorId,
        familyMemberId: familyMemberId || null,
        bookingId: appointment.id,
        status: 'BOOKED',
        urgencyLevel: urgencyLevel || 'ROUTINE'
      }, { transaction: t });

      return { appointment, careEpisode };
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'This consultation slot has already been booked by another patient.' });
    }
    if (err.message === 'SLOT_OCCUPIED') {
      return res.status(409).json({ success: false, message: 'This consultation slot has already been booked by another patient.' });
    }
    if (err.message === 'DOCTOR_NOT_FOUND_OR_NO_CLINIC') {
      return res.status(400).json({ success: false, message: 'Doctor or associated clinic not found.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const getAppointments = catchAsync(async (req, res) => {
  // Enforce clinic scope
  const clinicId = req.user.currentClinicId;
  const where = {};
  if (clinicId) {
    where.clinicId = clinicId;
  } else if (req.user.role === 'PATIENT') {
    where.patientId = req.user.id;
  }

  const appointments = await Appointment.findAll({ where });
  res.status(200).json(appointments);
});

const updateAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, ...rest } = req.body;
  
  if (paymentStatus === 'PAID_ONLINE') {
    return res.status(403).json({ success: false, message: 'Cannot set PAID_ONLINE directly' });
  }

  const appointment = await Appointment.findByPk(id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

  // Optional: check clinic scope
  if (req.user.currentClinicId && appointment.clinicId !== req.user.currentClinicId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await appointment.update(rest);
  res.status(200).json({ success: true, data: appointment });
});

module.exports = { bookAppointment, getAppointments, updateAppointment };
