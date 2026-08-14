const express = require('express');
const router = express.Router();
const clinicAdminController = require('../controllers/clinicAdmin.controller');
const authenticate = require('../middleware/auth.middleware');

const requireFeature = require('../middleware/featureGate.middleware');

// Protect all routes
router.use(authenticate);

// Middleware to ensure the user is a Clinic Admin
const requireClinicAdmin = (req, res, next) => {
  if (req.user.role !== 'CLINIC_ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden. Clinic Admin access required.' });
  }
  next();
};

router.use(requireClinicAdmin);

router.get('/dashboard', clinicAdminController.getDashboard);
router.get('/staff', clinicAdminController.getStaff);
router.put('/staff/:id', clinicAdminController.updateStaff);
router.get('/subscription', clinicAdminController.getSubscription);
router.get('/revenue', requireFeature('advanced_reports', 'PRO'), clinicAdminController.getRevenueReport);
router.get('/doctors', clinicAdminController.getDoctors);

module.exports = router;
