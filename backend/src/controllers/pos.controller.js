const { sequelize, Invoice, InvoiceItem, Consultation, Product, CareEpisode, Prescription, PrescriptionItem, AuditLog, InventoryBatch, CashRegisterShift, StockMovement } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { MockPaymentProvider } = require('../services/payment.service');
const { Op } = require('sequelize');
const { sendNotification } = require('../services/notification.service');

const generateInvoice = catchAsync(async (req, res) => {
  const { consultationId, patientName, items, discount } = req.body;
  const doctorId = req.user.id;
  const clinicId = req.user.clinicId;

  if (!clinicId) {
    return res.status(403).json({ success: false, message: 'Practitioner is not associated with any clinic.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      let fee = 15.00;
      let finalPatientName = patientName || 'Walk-in Patient';

      // If linked to a consultation, fetch notes and check patient name
      if (consultationId) {
        const consult = await Consultation.findByPk(consultationId, {
          include: [{ association: 'patient' }],
          transaction: t
        });
        if (consult) {
          fee = parseFloat(consult.fee || 15.00);
          if (consult.patient) {
            finalPatientName = consult.patient.name;
          }
        }
      }

      const itemsList = items || [];
      const itemRecords = [];
      let subtotal = 0;

      for (const item of itemsList) {
        if (item.productId && item.quantity) {
          const product = await Product.findOne({
            where: { id: item.productId, clinicId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });

          if (!product) {
            throw new Error(`Product not found.`);
          }

          // FEFO Inventory Logic (First-Expiring, First-Out)
          let quantityToDeduct = item.quantity;
          const batches = await InventoryBatch.findAll({
            where: { productId: product.id },
            order: [['expiryDate', 'ASC']],
            lock: t.LOCK.UPDATE,
            transaction: t
          });

          // Check total batch quantity
          const totalBatchQty = batches.reduce((sum, b) => sum + b.quantity, 0);
          if (totalBatchQty < quantityToDeduct) {
             throw new Error(`Insufficient batch stock for ${product.name}. Available: ${totalBatchQty}, Requested: ${quantityToDeduct}`);
          }

          for (const batch of batches) {
            if (quantityToDeduct <= 0) break;
            if (batch.quantity > 0) {
              const deductAmount = Math.min(batch.quantity, quantityToDeduct);
              batch.quantity -= deductAmount;
              quantityToDeduct -= deductAmount;
              await batch.save({ transaction: t });
            }
          }

          product.stockCount -= item.quantity;
          await product.save({ transaction: t });

          const price = parseFloat(product.sellingPrice);
          const totalItemPrice = price * item.quantity;
          subtotal += totalItemPrice;

          itemRecords.push({
            productId: product.id,
            quantity: item.quantity,
            unitPrice: price,
            price: totalItemPrice,
            itemName: `${product.name} (x${item.quantity})`
          });
        } else if (item.itemName) {
          const price = parseFloat(item.price || 0);
          subtotal += price;
          itemRecords.push({
            itemName: item.itemName,
            quantity: 1,
            unitPrice: price,
            price: price
          });
        }
      }

      // Add consultation fee item automatically if consultationId is supplied or no items provided
      if (consultationId) {
        itemRecords.push({ itemName: 'Consultation Fee', price: fee, quantity: 1, unitPrice: fee });
        subtotal += fee;
      } else if (itemRecords.length === 0) {
        itemRecords.push({ itemName: 'Consultation Fee', price: fee, quantity: 1, unitPrice: fee });
        subtotal += fee;
      }

      const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% healthcare tax
      const disc = parseFloat(discount || 0);
      const total = Math.max(0, parseFloat((subtotal + tax - disc).toFixed(2)));

      const invoice = await Invoice.create({
        consultationId: consultationId || null,
        clinicId,
        totalAmount: total,
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        taxApplied: tax
      }, { transaction: t });

      // Create item lines
      const finalItemRecords = itemRecords.map(record => ({
        ...record,
        invoiceId: invoice.id
      }));

      await InvoiceItem.bulkCreate(finalItemRecords, { transaction: t });

      // Fetch invoice with items
      const completeInvoice = await Invoice.findByPk(invoice.id, {
        include: [{ model: InvoiceItem, as: 'items' }],
        transaction: t
      });

      return completeInvoice;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('Insufficient stock') || err.message.includes('Product not found')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const payInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, items, insuranceClaimAmount, patientPayableAmount } = req.body;
  const clinicId = req.user.clinicId;

  if (!['CASH', 'CARD', 'UPI', 'MIXED'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method. Use CASH, CARD, UPI, or MIXED.' });
  }

  // Simulate payment
  await MockPaymentProvider.processPayment(1, paymentMethod, {});

  try {
    const result = await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
      if (!invoice) throw new Error('INVOICE_NOT_FOUND');
      if (invoice.paymentStatus === 'PAID') throw new Error('ALREADY_PAID');
      if (invoice.clinicId !== clinicId) throw new Error('UNAUTHORIZED');

      let subtotalIncrease = 0;
      const newInvoiceItems = [];
      let lowStockWarning = false;

      // Process dispensed drugs (items from the POS cart)
      if (items && items.length > 0) {
        for (const item of items) {
          if (!item.productId || !item.quantity) continue;
          
          // Lock product to safely deduct stock
          const product = await Product.findOne({
            where: { id: item.productId, clinicId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          if (product.stockCount < item.quantity) throw new Error(`Insufficient stock for product: ${product.name}`);

          // Controlled Substance Gate: Evaluate product.scheduleClass before deducting stock
          if (['H1', 'X'].includes(product.scheduleClass)) {
            if (req.user.role !== 'PHARMACIST' && req.user.role !== 'DOCTOR') {
              throw new Error(`CONTROLLED_SUBSTANCE_RESTRICTION: Only pharmacists or doctors can dispense Schedule ${product.scheduleClass} drugs.`);
            }

            await AuditLog.create({
              clinicId,
              userId: req.user.id,
              action: 'DISPENSED_CONTROLLED',
              entityId: product.id,
              details: {
                productId: product.id,
                productName: product.name,
                scheduleClass: product.scheduleClass,
                quantityDispensed: item.quantity,
                ...(item.prescriptionItemId ? { prescriptionItemId: item.prescriptionItemId } : {})
              }
            }, { transaction: t });
          }

          // FEFO Inventory Logic (First-Expiring, First-Out)
          let quantityToDeduct = item.quantity;
          const batches = await InventoryBatch.findAll({
            where: { productId: product.id },
            order: [['expiryDate', 'ASC']],
            lock: t.LOCK.UPDATE,
            transaction: t
          });

          // Check total batch quantity
          const totalBatchQty = batches.reduce((sum, b) => sum + b.quantity, 0);
          if (totalBatchQty < quantityToDeduct) {
             throw new Error(`Insufficient batch stock for ${product.name}. Available: ${totalBatchQty}, Requested: ${quantityToDeduct}`);
          }

          for (const batch of batches) {
            if (quantityToDeduct <= 0) break;
            if (batch.quantity > 0) {
              const deductAmount = Math.min(batch.quantity, quantityToDeduct);
              batch.quantity -= deductAmount;
              quantityToDeduct -= deductAmount;
              await batch.save({ transaction: t });
            }
          }

          // Deduct global stock cache
          const prevStock = product.stockCount;
          product.stockCount -= item.quantity;
          await product.save({ transaction: t });
          
          await StockMovement.create({
            clinicId,
            productId: product.id,
            type: 'SALE',
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: product.stockCount,
            referenceType: 'INVOICE',
            referenceId: invoice.id,
            performedBy: req.user.id
          }, { transaction: t });

          if (product.stockCount < product.minimumStock) {
            lowStockWarning = true;
          }

          // Calculate cost
          const price = parseFloat(product.sellingPrice);
          const totalItemPrice = price * item.quantity;
          subtotalIncrease += totalItemPrice;

          newInvoiceItems.push({
            invoiceId: invoice.id,
            productId: product.id,
            itemName: `${product.name} (x${item.quantity})`,
            quantity: item.quantity,
            unitPrice: price,
            price: totalItemPrice
          });

          // Traceability: Bump PrescriptionItem.quantityDispensed if linked
          if (item.prescriptionItemId) {
            const pItem = await PrescriptionItem.findByPk(item.prescriptionItemId, { lock: t.LOCK.UPDATE, transaction: t });
            if (pItem) {
              pItem.quantityDispensed += item.quantity;
              await pItem.save({ transaction: t });
            }
          }
        }

        if (newInvoiceItems.length > 0) {
          await InvoiceItem.bulkCreate(newInvoiceItems, { transaction: t });
          
          // Update invoice totals
          const newTax = parseFloat((subtotalIncrease * 0.05).toFixed(2));
          invoice.taxApplied = parseFloat(invoice.taxApplied) + newTax;
          invoice.totalAmount = parseFloat(invoice.totalAmount) + subtotalIncrease + newTax;
        }
      }

      invoice.paymentMethod = paymentMethod;
      invoice.paymentStatus = 'PAID';
      
      let amountPaidByPatient = invoice.totalAmount;
      if (paymentMethod === 'MIXED' && (insuranceClaimAmount !== undefined || patientPayableAmount !== undefined)) {
        invoice.insuranceClaimAmount = insuranceClaimAmount || 0;
        invoice.patientPayableAmount = patientPayableAmount || 0;
        amountPaidByPatient = invoice.patientPayableAmount;
      } else {
        invoice.patientPayableAmount = invoice.totalAmount;
      }

      await invoice.save({ transaction: t });

      // Log into Shift Register if available (for clinic staff, not patients paying their own invoice)
      if (req.user.role !== 'PATIENT') {
        const activeShift = await CashRegisterShift.findOne({
          where: { userId: req.user.id, clinicId, status: 'OPEN' },
          lock: t.LOCK.UPDATE,
          transaction: t
        });

        if (activeShift) {
          if (paymentMethod === 'CASH') activeShift.totalCashSales = parseFloat(activeShift.totalCashSales) + amountPaidByPatient;
          else if (paymentMethod === 'CARD') activeShift.totalCardSales = parseFloat(activeShift.totalCardSales) + amountPaidByPatient;
          else if (paymentMethod === 'UPI') activeShift.totalUpiSales = parseFloat(activeShift.totalUpiSales) + amountPaidByPatient;
          else if (paymentMethod === 'MIXED') {
            // In a real system you'd specify cash vs card split. Default to card for MIXED co-pays.
            activeShift.totalCardSales = parseFloat(activeShift.totalCardSales) + amountPaidByPatient;
          }
          await activeShift.save({ transaction: t });
        }
      }

      await invoice.save({ transaction: t });

      // If associated with a consultation/care episode, update status
      if (invoice.consultationId) {
        const consult = await Consultation.findByPk(invoice.consultationId, { transaction: t });
        if (consult) {
          consult.paymentStatus = 'PAID';
          await consult.save({ transaction: t });
        }
        
        // If items were dispensed and we know the patient, send READY_FOR_PICKUP notification
        if (newInvoiceItems.length > 0 && consult) {
          return { invoice, lowStockWarning, notifyPatientId: consult.patientId };
        }
      }

      return { invoice, lowStockWarning };
    });

    if (result.lowStockWarning) {
      res.setHeader('X-Low-Stock-Warning', 'true');
    }
    
    // Send Notification outside transaction
    if (result.notifyPatientId) {
      await sendNotification(clinicId, result.notifyPatientId, 'READY_FOR_PICKUP', { invoiceId: result.invoice.id });
    }

    res.status(200).json({ success: true, data: result.invoice });
  } catch (err) {
    if (['INVOICE_NOT_FOUND', 'ALREADY_PAID', 'UNAUTHORIZED'].includes(err.message) || err.message.startsWith('Insufficient') || err.message.startsWith('Product') || err.message.startsWith('CONTROLLED_SUBSTANCE_RESTRICTION')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const getClinicInvoices = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const invoices = await Invoice.findAll({
    where: { clinicId },
    include: [
      { model: InvoiceItem, as: 'items' },
      { 
        model: Consultation, 
        as: 'consultation',
        include: [{ association: 'patient', attributes: ['name', 'email'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  const data = invoices.map(inv => {
    const json = inv.toJSON();
    json.patientName = json.consultation?.patient?.name || 'Walk-in Patient';
    return json;
  });

  res.status(200).json({ success: true, data });
});

const renewSubscription = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { Clinic } = require('../models');

  if (!clinicId) {
    return res.status(400).json({ success: false, message: 'User is not associated with any clinic.' });
  }

  const clinic = await Clinic.findByPk(clinicId);
  if (!clinic) {
    return res.status(404).json({ success: false, message: 'Clinic not found.' });
  }

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 30); // Extend 30 days

  clinic.subscriptionStatus = 'ACTIVE';
  clinic.subscriptionExpiresAt = newExpiry;
  await clinic.save();

  res.status(200).json({ success: true, message: 'Subscription successfully extended by 30 days.', data: clinic });
});

const lookupEpisode = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { patientId, consultationId } = req.query;

  if (!patientId && !consultationId) {
    return res.status(400).json({ success: false, message: 'Either patientId or consultationId must be provided for lookup.' });
  }

  const where = { clinicId };
  if (patientId) where.patientId = patientId;
  if (consultationId) where.bookingId = consultationId;

  const episode = await CareEpisode.findOne({
    where,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Invoice,
        as: 'invoice',
        include: [{ model: InvoiceItem, as: 'items' }]
      },
      {
        model: Prescription,
        as: 'prescriptionRecord',
        include: [{ 
          model: PrescriptionItem, 
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }]
      },
      {
        model: Consultation,
        as: 'booking',
        include: [{ association: 'patient' }, { association: 'doctor' }]
      }
    ]
  });

  if (!episode) {
    return res.status(404).json({ success: false, message: 'No care episode found matching criteria.' });
  }

  res.status(200).json({ success: true, data: episode });
});

const getDailySales = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { Op } = require('sequelize');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sales = await Invoice.findAll({
    where: {
      clinicId,
      paymentStatus: 'PAID',
      updatedAt: { [Op.gte]: today }
    },
    attributes: [
      'paymentMethod',
      [sequelize.fn('sum', sequelize.col('totalAmount')), 'total']
    ],
    group: ['paymentMethod']
  });

  res.status(200).json({ success: true, data: sales });
});

const updateInventory = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { id, name, sku, stockQuantity, retailPrice, scheduleClass } = req.body;

  let product;
  if (id) {
    product = await Product.findOne({ where: { id, clinicId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (name) product.name = name;
    if (sku) product.sku = sku;
    
    if (stockQuantity !== undefined) {
      const stockDiff = stockQuantity - product.stockCount;
      product.stockCount = stockQuantity;
      
      // If stock increased, add a new batch with a generic expiry
      if (stockDiff > 0) {
        const { InventoryBatch } = require('../models');
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
        await InventoryBatch.create({
          clinicId,
          productId: product.id,
          batchNumber: `AUTO-${Date.now()}`,
          quantity: stockDiff,
          expiryDate
        });
      }
    }
    
    if (retailPrice !== undefined) product.sellingPrice = retailPrice;
    if (scheduleClass) product.scheduleClass = scheduleClass;
    await product.save();
  } else {
    product = await Product.create({
      clinicId,
      name,
      sku,
      stockCount: stockQuantity,
      sellingPrice: retailPrice,
      scheduleClass
    });
    
    // Create initial batch for new products so FEFO doesn't block checkout
    if (stockQuantity > 0) {
      const { InventoryBatch } = require('../models');
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
      await InventoryBatch.create({
        clinicId,
        productId: product.id,
        batchNumber: `INIT-${Date.now()}`,
        quantity: stockQuantity,
        expiryDate
      });
    }
  }

  res.status(200).json({ success: true, data: product });
});

const getShiftStatus = catchAsync(async (req, res) => {
  const shift = await CashRegisterShift.findOne({
    where: { userId: req.user.id, clinicId: req.user.clinicId, status: 'OPEN' }
  });
  res.status(200).json({ success: true, data: shift });
});

const openShift = catchAsync(async (req, res) => {
  const { openingBalance } = req.body;
  const existing = await CashRegisterShift.findOne({
    where: { userId: req.user.id, clinicId: req.user.clinicId, status: 'OPEN' }
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have an open shift.' });
  }

  const shift = await CashRegisterShift.create({
    clinicId: req.user.clinicId,
    userId: req.user.id,
    openingBalance: openingBalance || 0,
    status: 'OPEN'
  });

  res.status(201).json({ success: true, data: shift });
});

const closeShift = catchAsync(async (req, res) => {
  const { expectedClosingBalance } = req.body;
  const shift = await CashRegisterShift.findOne({
    where: { userId: req.user.id, clinicId: req.user.clinicId, status: 'OPEN' }
  });
  
  if (!shift) {
    return res.status(404).json({ success: false, message: 'No open shift found to close.' });
  }

  // Calculate totals from invoices created during this shift
  const { Op } = require('sequelize');
  const invoices = await Invoice.findAll({
    where: {
      clinicId: req.user.clinicId,
      paymentStatus: 'PAID',
      updatedAt: { [Op.gte]: shift.openedAt } // Assuming they were paid during the shift
    }
  });

  let totalCash = 0;
  let totalCard = 0;
  let totalUpi = 0;

  invoices.forEach(inv => {
    const amount = parseFloat(inv.totalAmount);
    if (inv.paymentMethod === 'CASH') totalCash += amount;
    if (inv.paymentMethod === 'CARD') totalCard += amount;
    if (inv.paymentMethod === 'UPI') totalUpi += amount;
    if (inv.paymentMethod === 'MIXED') {
      // For simplicity, if mixed we'd normally track the split. We'll just put it to cash for now unless split data exists.
      totalCash += amount; 
    }
  });

  shift.totalCashSales = totalCash;
  shift.totalCardSales = totalCard;
  shift.totalUpiSales = totalUpi;
  shift.closingBalance = parseFloat(shift.openingBalance) + totalCash;
  shift.expectedClosingBalance = expectedClosingBalance || shift.closingBalance;
  shift.status = 'CLOSED';
  shift.closedAt = new Date();

  await shift.save();

  res.status(200).json({ success: true, data: shift });
});

module.exports = { generateInvoice, payInvoice, getClinicInvoices, renewSubscription, lookupEpisode, getDailySales, updateInventory, getShiftStatus, openShift, closeShift };
