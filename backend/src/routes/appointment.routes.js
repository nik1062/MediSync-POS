const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/book', appointmentController.bookAppointment);
router.get('/', appointmentController.getAppointments);
router.put('/:id', appointmentController.updateAppointment);

module.exports = router;
