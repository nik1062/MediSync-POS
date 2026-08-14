const catchAsync = require('../utils/catchAsync');
const clinicAdminService = require('../services/clinicAdmin.service');

const getDashboard = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const data = await clinicAdminService.getClinicDashboard(clinicId);
  res.json({ success: true, data });
});

const getStaff = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const data = await clinicAdminService.getStaffList(clinicId);
  res.json({ success: true, data });
});

const updateStaff = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const staffId = req.params.id;
  const data = await clinicAdminService.updateStaff(clinicId, staffId, req.body);
  res.json({ success: true, data });
});

const getSubscription = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const data = await clinicAdminService.getSubscription(clinicId);
  res.json({ success: true, data });
});

const getRevenueReport = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const data = await clinicAdminService.getRevenueReport(clinicId, req.query);
  res.json({ success: true, data });
});

const getDoctors = catchAsync(async (req, res) => {
  const clinicId = req.user.currentClinicId;
  const data = await clinicAdminService.getDoctors(clinicId);
  res.json({ success: true, data });
});

module.exports = {
  getDashboard,
  getStaff,
  updateStaff,
  getSubscription,
  getRevenueReport,
  getDoctors,
};
