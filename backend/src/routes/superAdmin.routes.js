const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdmin.controller');
const authenticate = require('../middleware/auth.middleware');
const requireSuperAdmin = require('../middleware/superAdmin.middleware');

// Protect all routes and require Super Admin role
router.use(authenticate, requireSuperAdmin);

router.get('/stats', superAdminController.getPlatformStats);
router.get('/tenants', superAdminController.listTenants);
router.get('/tenants/:id', superAdminController.getTenantDetail);
router.put('/tenants/:id/license', superAdminController.updateTenantLicense);

router.get('/features', superAdminController.getFeatureFlags);
router.post('/features', superAdminController.upsertFeatureFlag);
router.put('/features/:id', superAdminController.updateFeatureFlag);

module.exports = router;
