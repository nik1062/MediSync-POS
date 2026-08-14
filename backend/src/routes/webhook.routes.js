const express = require('express');
const router = express.Router();
const { Appointment } = require('../models');

router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (signature !== 'valid-signature') {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { appointmentId, status } = req.body;
  if (status === 'captured') {
    const appointment = await Appointment.findByPk(appointmentId);
    if (appointment) {
      await appointment.update({ paymentStatus: 'PAID_ONLINE' });
    }
  }

  res.status(200).json({ success: true });
});

module.exports = router;
