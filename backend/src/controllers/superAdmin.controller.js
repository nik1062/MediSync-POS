const catchAsync = require('../utils/catchAsync');
const superAdminService = require('../services/superAdmin.service');

const listTenants = catchAsync(async (req, res) => {
  const data = await superAdminService.listTenants(req.query);
  res.json({ success: true, data });
});

const getTenantDetail = catchAsync(async (req, res) => {
  const data = await superAdminService.getTenantDetail(req.params.id);
  res.json({ success: true, data });
});

const updateTenantLicense = catchAsync(async (req, res) => {
  const data = await superAdminService.updateTenantLicense(req.params.id, req.body, req.user.id);
  res.json({ success: true, data });
});

const getPlatformStats = catchAsync(async (req, res) => {
  const data = await superAdminService.getPlatformStats();
  res.json({ success: true, data });
});

const getFeatureFlags = catchAsync(async (req, res) => {
  const data = await superAdminService.getFeatureFlags();
  res.json({ success: true, data });
});

const updateFeatureFlag = catchAsync(async (req, res) => {
  const data = await superAdminService.updateFeatureFlag(req.params.id, req.body);
  res.json({ success: true, data });
});

const upsertFeatureFlag = catchAsync(async (req, res) => {
  const data = await superAdminService.upsertFeatureFlag(req.body);
  res.json({ success: true, data });
});

module.exports = {
  listTenants,
  getTenantDetail,
  updateTenantLicense,
  getPlatformStats,
  getFeatureFlags,
  updateFeatureFlag,
  upsertFeatureFlag,
};
