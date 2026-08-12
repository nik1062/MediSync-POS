const consultationService = require('../services/consultation.service');
const { sequelize, Consultation, CareEpisode, Prescription, PrescriptionItem, Product, Invoice, InvoiceItem } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { sendNotification } = require('../services/notification.service');

const createConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.createConsultation(
    req.user.id, 
    req.body.doctorId, 
    req.body.scheduledAt,
    req.body.paymentStatus,
    req.body.fee,
    req.body.familyMemberId
  );
  
  // Notification: Booking Confirmed
  await sendNotification(req.user.clinicId || null, req.user.id, 'BOOKING_CONFIRMED', { consultationId: consultation.id });

  res.status(201).json({ success: true, data: consultation });
});

const listConsultations = catchAsync(async (req, res) => {
  const consultations = await consultationService.listConsultationsForUser(req.user);
  res.status(200).json({ success: true, data: consultations });
});

const getConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.getConsultationById(req.params.id, req.user);
  res.status(200).json({ success: true, data: consultation });
});

const updateStatus = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateStatus(req.params.id, req.body.status, req.user);
  
  if (req.body.status === 'ACTIVE') {
    // Notification: Doctor Online / Starting Soon
    await sendNotification(req.user.clinicId || null, consultation.patientId, 'DOCTOR_ONLINE', { consultationId: consultation.id });
  }

  res.status(200).json({ success: true, data: consultation });
});

const escalateConsultation = catchAsync(async (req, res) => {
  const consultationId = req.params.id;
  const doctorId = req.user.id;
  
  try {
    const result = await sequelize.transaction(async (t) => {
      const consultation = await Consultation.findByPk(consultationId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!consultation || consultation.doctorId !== doctorId) throw new Error('UNAUTHORIZED');
      
      const episode = await CareEpisode.findOne({ where: { bookingId: consultation.id }, lock: t.LOCK.UPDATE, transaction: t });
      if (episode) {
        episode.status = 'IN_PERSON_URGENT';
        await episode.save({ transaction: t });
      }

      consultation.status = 'CANCELLED'; // End the online session
      await consultation.save({ transaction: t });
      
      return { consultation, episode };
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

const updateNotes = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateNotes(req.params.id, req.body.notes, req.user);
  res.status(200).json({ success: true, data: consultation });
});

const finalizeConsultation = catchAsync(async (req, res) => {
  const consultationId = req.params.id;
  const { notes, prescriptionItems } = req.body;
  const doctorId = req.user.id;
  const clinicId = req.user.clinicId;

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Lock Consultation
      const consultation = await Consultation.findByPk(consultationId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!consultation) throw new Error('CONSULTATION_NOT_FOUND');
      if (consultation.doctorId !== doctorId) throw new Error('UNAUTHORIZED');
      if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') throw new Error('ALREADY_FINALIZED');

      // 2. Find CareEpisode
      const episode = await CareEpisode.findOne({
        where: { bookingId: consultation.id },
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!episode) throw new Error('CARE_EPISODE_NOT_FOUND');

      // Update SOAP notes
      if (notes) {
        consultation.notes = typeof notes === 'string' ? notes : JSON.stringify(notes);
      }
      consultation.status = 'COMPLETED';
      await consultation.save({ transaction: t });

      // Handle Structured Plan -> Prescription Items
      const items = prescriptionItems || [];
      if (items.length > 0) {
        // Find or create Prescription
        let prescription = null;
        if (episode.prescriptionId) {
          prescription = await Prescription.findByPk(episode.prescriptionId, { lock: t.LOCK.UPDATE, transaction: t });
        }

        if (!prescription) {
          prescription = await Prescription.create({
            clinicId,
            careEpisodeId: episode.id,
            consultationId: consultation.id,
            patientId: episode.patientId,
            doctorId,
            familyMemberId: consultation.familyMemberId || null,
            status: 'DRAFT'
          }, { transaction: t });
          episode.prescriptionId = prescription.id;
        }

        // Verify products and create items
        for (const item of items) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (!product || product.clinicId !== clinicId) throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
          
          await PrescriptionItem.create({
            clinicId,
            prescriptionId: prescription.id,
            productId: item.productId,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            substitutionAllowed: item.substitutionAllowed || false,
            scheduleClass: item.scheduleClass,
            quantityPrescribed: item.quantityPrescribed,
            quantityDispensed: 0
          }, { transaction: t });
        }

        // Sign prescription
        prescription.status = 'SIGNED';
        prescription.signedAt = new Date();
        prescription.signatureHash = 'hash_' + Date.now(); // pseudo hash
        await prescription.save({ transaction: t });

        episode.status = 'PRESCRIBED';
      } else {
        episode.status = 'COMPLETED';
      }
      
      // Auto-Invoice for Consultation Fee
      if (!episode.invoiceId) {
        const fee = parseFloat(consultation.fee || 15.00);
        const tax = parseFloat((fee * 0.05).toFixed(2));
        const total = parseFloat((fee + tax).toFixed(2));

        const invoice = await Invoice.create({
          consultationId: consultation.id,
          clinicId,
          totalAmount: total,
          paymentStatus: 'UNPAID',
          paymentMethod: 'CASH',
          taxApplied: tax
        }, { transaction: t });

        await InvoiceItem.create({
          invoiceId: invoice.id,
          itemName: 'Consultation Fee',
          price: fee
        }, { transaction: t });

        episode.invoiceId = invoice.id;
      }
      
      await episode.save({ transaction: t });

      return { consultation, episode, prescriptionCreated: !!prescription };
    });

    if (result.prescriptionCreated) {
      // Notification: Prescription Ready
      await sendNotification(clinicId, result.episode.patientId, 'PRESCRIPTION_READY', { consultationId: consultationId });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (['CONSULTATION_NOT_FOUND', 'UNAUTHORIZED', 'ALREADY_FINALIZED', 'CARE_EPISODE_NOT_FOUND'].includes(err.message) || err.message.startsWith('PRODUCT_NOT_FOUND')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const payConsultation = catchAsync(async (req, res) => {
  const consultationId = req.params.id;
  const { paymentMethod } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
      const consultation = await Consultation.findByPk(consultationId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!consultation) throw new Error('CONSULTATION_NOT_FOUND');
      if (consultation.patientId !== req.user.id) throw new Error('UNAUTHORIZED');

      const episode = await CareEpisode.findOne({ where: { bookingId: consultation.id }, transaction: t });
      if (!episode || !episode.invoiceId) throw new Error('NO_INVOICE_FOUND');

      const invoice = await Invoice.findByPk(episode.invoiceId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!invoice) throw new Error('INVOICE_NOT_FOUND');
      if (invoice.paymentStatus === 'PAID') throw new Error('ALREADY_PAID');

      invoice.paymentMethod = paymentMethod || 'CARD';
      invoice.paymentStatus = 'PAID';
      invoice.patientPayableAmount = invoice.totalAmount;
      await invoice.save({ transaction: t });

      consultation.paymentStatus = 'PAID';
      await consultation.save({ transaction: t });

      return invoice;
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (['CONSULTATION_NOT_FOUND', 'UNAUTHORIZED', 'NO_INVOICE_FOUND', 'INVOICE_NOT_FOUND', 'ALREADY_PAID'].includes(err.message)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { 
  createConsultation, 
  listConsultations, 
  getConsultation, 
  updateStatus,
  updateNotes,
  finalizeConsultation,
  payConsultation,
  escalateConsultation
};
