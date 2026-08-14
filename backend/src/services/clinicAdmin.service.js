const { User, DoctorProfile, Clinic, License, Appointment, Invoice, FeatureFlag } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

/**
 * Get clinic dashboard data.
 */
async function getClinicDashboard(clinicId) {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Today's stats
  const todayAppointments = await Appointment.count({ 
    where: { clinicId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] } } 
  });
  const todayCompleted = await Appointment.count({ 
    where: { clinicId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] }, status: 'COMPLETED' } 
  });
  const todayWaiting = await Appointment.count({ 
    where: { clinicId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] }, status: 'WAITING' } 
  });
  const todayInConsultation = await Appointment.count({ 
    where: { clinicId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] }, status: 'IN_CONSULTATION' } 
  });

  // Today's revenue
  const todayRevenue = await Invoice.sum('total', {
    where: {
      clinicId,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
      status: { [Op.in]: ['PAID', 'PARTIAL'] },
    },
  }) || 0;

  // Total patients
  const totalPatients = await User.count({ where: { clinicId, role: 'PATIENT' } });

  // Staff on duty
  const staffOnDuty = await User.count({ where: { clinicId, isActive: true, role: { [Op.ne]: 'PATIENT' } } });

  // Recent visits (Appointments)
  const recentVisits = await Appointment.findAll({
    where: { clinicId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] } },
    include: [
      { model: User, as: 'patient', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
    ],
    order: [['scheduledAt', 'DESC']],
    limit: 10,
  });

  return {
    today: {
      visits: todayAppointments,
      completed: todayCompleted,
      waiting: todayWaiting,
      inConsultation: todayInConsultation,
      revenue: parseFloat(todayRevenue),
    },
    totalPatients,
    staffOnDuty,
    recentVisits,
  };
}

/**
 * Get staff list for a clinic.
 */
async function getStaffList(clinicId) {
  return User.findAll({
    where: { clinicId, role: { [Op.ne]: 'PATIENT' } },
    attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
    order: [['role', 'ASC'], ['name', 'ASC']],
  });
}

/**
 * Update a staff member.
 */
async function updateStaff(clinicId, staffId, data) {
  const user = await User.findOne({ where: { id: staffId, clinicId } });
  if (!user) throw new ApiError(404, 'Staff member not found');

  if (user.role === 'CLINIC_ADMIN' && data.role && data.role !== 'CLINIC_ADMIN') {
    throw new ApiError(400, 'Cannot change the role of the clinic admin');
  }

  if (data.isActive !== undefined) user.isActive = data.isActive;
  if (data.name) user.name = data.name;
  await user.save();

  return user;
}

/**
 * Get subscription info for a clinic.
 */
async function getSubscription(clinicId) {
  const clinic = await Clinic.findByPk(clinicId, {
    include: [{ model: License, as: 'license' }],
  });
  if (!clinic) throw new ApiError(404, 'Clinic not found');

  // Get feature flags for current plan
  let features = [];
  if (clinic.license?.plan) {
    const flags = await FeatureFlag.findAll({
      where: { plan: clinic.license.plan, enabled: true },
    });
    features = flags.map(f => f.featureKey);
  }

  return {
    clinic: { id: clinic.id, name: clinic.name },
    license: clinic.license,
    features,
  };
}

/**
 * Get revenue report for a clinic.
 */
async function getRevenueReport(clinicId, { startDate, endDate, groupBy = 'day' }) {
  const where = { clinicId, status: { [Op.in]: ['PAID', 'PARTIAL'] } };

  if (startDate) {
    where.createdAt = where.createdAt || {};
    where.createdAt[Op.gte] = new Date(startDate);
  }
  if (endDate) {
    where.createdAt = where.createdAt || {};
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.createdAt[Op.lte] = end;
  }

  const invoices = await Invoice.findAll({
    where,
    order: [['createdAt', 'ASC']],
  });

  // Aggregate by day
  const dailyRevenue = {};
  let totalRevenue = 0;
  let totalInvoices = 0;

  for (const invoice of invoices) {
    const day = invoice.createdAt.toISOString().split('T')[0];
    if (!dailyRevenue[day]) {
      dailyRevenue[day] = { date: day, revenue: 0, bills: 0, cash: 0, upi: 0, card: 0 };
    }
    const amount = parseFloat(invoice.total) || 0;
    dailyRevenue[day].revenue += amount;
    dailyRevenue[day].bills += 1;
    if (invoice.paymentMethod) {
      const pm = invoice.paymentMethod.toLowerCase();
      dailyRevenue[day][pm] = (dailyRevenue[day][pm] || 0) + amount;
    }
    totalRevenue += amount;
    totalInvoices += 1;
  }

  return {
    daily: Object.values(dailyRevenue),
    totalRevenue,
    totalBills: totalInvoices,
  };
}

/**
 * Get list of doctors in a clinic.
 */
async function getDoctors(clinicId) {
  return User.findAll({
    where: { clinicId, role: 'DOCTOR', isActive: true },
    attributes: ['id', 'name', 'email'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
  });
}

module.exports = {
  getClinicDashboard,
  getStaffList,
  updateStaff,
  getSubscription,
  getRevenueReport,
  getDoctors,
};
