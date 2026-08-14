const express = require('express');
const prescriptionController = require('../controllers/prescription.controller');
const authenticate = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const requireFeature = require('../middleware/featureGate.middleware');

const router = express.Router();

router.use(authenticate);
router.use(requireFeature('prescription_module', 'STARTER'));

router.post('/draft', restrictTo('DOCTOR'), prescriptionController.createDraft);
router.post('/:prescriptionId/items', restrictTo('DOCTOR'), prescriptionController.addItem);
router.get('/my', restrictTo('PATIENT'), prescriptionController.getMyPrescriptions);

module.exports = router;
