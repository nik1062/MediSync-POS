const { sequelize, CareEpisode, Prescription, PrescriptionItem, Product } = require('../models');
const catchAsync = require('../utils/catchAsync');

const createDraft = catchAsync(async (req, res) => {
  const { careEpisodeId, consultationId, patientId } = req.body;
  const doctorId = req.user.id;
  const clinicId = req.user.clinicId;

  if (!careEpisodeId || !consultationId || !patientId) {
    return res.status(400).json({ success: false, message: 'careEpisodeId, consultationId, patientId required.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // Row level locking pattern on CareEpisode to prevent parallel duplicate prescriptions
      const careEpisode = await CareEpisode.findByPk(careEpisodeId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!careEpisode) {
        throw new Error('CARE_EPISODE_NOT_FOUND');
      }
      
      if (careEpisode.prescriptionId) {
        throw new Error('PRESCRIPTION_ALREADY_EXISTS');
      }

      const prescription = await Prescription.create({
        clinicId,
        careEpisodeId,
        consultationId,
        patientId,
        doctorId,
        status: 'DRAFT'
      }, { transaction: t });

      // Link back to CareEpisode
      careEpisode.prescriptionId = prescription.id;
      careEpisode.status = 'PRESCRIBED';
      await careEpisode.save({ transaction: t });

      return prescription;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'PRESCRIPTION_ALREADY_EXISTS') {
      return res.status(409).json({ success: false, message: 'A prescription already exists for this care episode.' });
    }
    if (err.message === 'CARE_EPISODE_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Care episode not found.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const addItem = catchAsync(async (req, res) => {
  const { prescriptionId } = req.params;
  const { productId, dosage, frequency, durationDays, substitutionAllowed, scheduleClass, quantityPrescribed } = req.body;
  const clinicId = req.user.clinicId;

  if (!productId || !dosage || !frequency || !durationDays || !quantityPrescribed) {
    return res.status(400).json({ success: false, message: 'Missing required item fields.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // Row lock the prescription to prevent concurrent modifications
      const prescription = await Prescription.findByPk(prescriptionId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!prescription) throw new Error('PRESCRIPTION_NOT_FOUND');
      if (prescription.status !== 'DRAFT') throw new Error('PRESCRIPTION_NOT_DRAFT');
      if (prescription.clinicId !== clinicId) throw new Error('UNAUTHORIZED');

      const product = await Product.findByPk(productId, { transaction: t });
      if (!product || product.clinicId !== clinicId) throw new Error('PRODUCT_NOT_FOUND');

      const item = await PrescriptionItem.create({
        clinicId,
        prescriptionId,
        productId,
        dosage,
        frequency,
        durationDays,
        substitutionAllowed: substitutionAllowed || false,
        scheduleClass,
        quantityPrescribed,
        quantityDispensed: 0
      }, { transaction: t });

      return item;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (['PRESCRIPTION_NOT_FOUND', 'PRESCRIPTION_NOT_DRAFT', 'PRODUCT_NOT_FOUND', 'UNAUTHORIZED'].includes(err.message)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const getMyPrescriptions = catchAsync(async (req, res) => {
  const patientId = req.user.id;
  const prescriptions = await Prescription.findAll({
    where: { patientId },
    include: [{
      model: PrescriptionItem,
      as: 'items',
      include: [{ model: Product, as: 'product', attributes: ['name', 'manufacturer'] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({ success: true, data: prescriptions });
});

module.exports = { createDraft, addItem, getMyPrescriptions };
