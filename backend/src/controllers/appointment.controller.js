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

module.exports = { bookAppointment };
