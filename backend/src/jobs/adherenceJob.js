const { Op } = require('sequelize');
const { Prescription, PrescriptionItem, Product } = require('../models');
const { sendNotification } = require('../services/notification.service');

const checkAdherence = async () => {
  console.log('[Cron Job] Running Medication Adherence Check...');
  try {
    const prescriptions = await Prescription.findAll({
      where: { status: 'DISPENSED' },
      include: [
        {
          model: PrescriptionItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    for (const prescription of prescriptions) {
      const dispenseDate = new Date(prescription.updatedAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - dispenseDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Calculate days since dispensed

      for (const item of prescription.items) {
        if (diffDays <= item.durationDays) {
          await sendNotification(prescription.clinicId, prescription.patientId, 'MEDICATION_REMINDER', {
            drugName: item.product?.name || 'Your medication',
            currentDay: diffDays,
            totalDays: item.durationDays
          });
        }
      }
    }
  } catch (error) {
    console.error('[Cron Job Error] Failed to run medication adherence check', error);
  }
};

module.exports = {
  checkAdherence
};
