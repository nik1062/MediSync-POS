const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');
const authenticate = require('../middleware/auth.middleware');
const { Clinic } = require('../models');

// Middleware to verify active clinic subscription
const checkClinicSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, message: 'POS billing terminal access is limited to Doctor roles.' });
    }

    if (!req.user.clinicId) {
      return res.status(403).json({ success: false, message: 'Access denied. Practitioner profile is not associated with any Clinic workspace.' });
    }

    const clinic = await Clinic.findByPk(req.user.clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic profile workspace not found.' });
    }

    const isExpired = new Date(clinic.subscriptionExpiresAt) < new Date();
    if (clinic.subscriptionStatus !== 'ACTIVE' || isExpired) {
      return res.status(402).json({ 
        success: false, 
        message: 'Clinic POS subscription has expired or is inactive. Please renew subscription to access Billing Terminal.',
        isExpired: true,
        clinicId: clinic.id
      });
    }

    req.clinic = clinic;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.use(authenticate);

router.post('/renew', posController.renewSubscription);

router.use(checkClinicSubscription);

router.get('/lookup', posController.lookupEpisode);
router.post('/generate', posController.generateInvoice);
router.put('/:id/pay', posController.payInvoice);
router.get('/', posController.getClinicInvoices);

// Shift Registers
router.get('/shift', posController.getShiftStatus);
router.post('/shift/open', posController.openShift);
router.post('/shift/close', posController.closeShift);

router.get('/patients/search', async (req, res) => {
  const { User } = require('../models');
  const { Op } = require('sequelize');
  const clinicId = req.user.clinicId;
  const { query } = req.query;
  
  if (!query) return res.json({ success: true, data: [] });
  
  const patients = await User.findAll({
    where: {
      clinicId,
      role: 'PATIENT',
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { phone: { [Op.like]: `%${query}%` } }
      ]
    },
    attributes: ['id', 'name', 'phone', 'email'],
    limit: 10
  });
  
  res.json({ success: true, data: patients });
});

router.post('/inventory', posController.updateInventory);
router.get('/analytics/daily-sales', posController.getDailySales);

module.exports = router;
