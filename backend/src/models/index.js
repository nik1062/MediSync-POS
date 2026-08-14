const sequelize = require('../config/database');
const User = require('./user.model');
const DoctorProfile = require('./doctorProfile.model');
const Appointment = require('./appointment.model');
const Consultation = require('./consultation.model');
const Message = require('./message.model');
const DoctorAvailability = require('./doctorAvailability.model');
const Clinic = require('./clinic.model');
const Invoice = require('./invoice.model');
const InvoiceItem = require('./invoiceItem.model');
const Product = require('./product.model');
const CareEpisode = require('./careEpisode.model');
const Prescription = require('./prescription.model');
const PrescriptionItem = require('./prescriptionItem.model');
const AuditLog = require('./auditLog.model');
const InventoryBatch = require('./inventoryBatch.model');
const CashRegisterShift = require('./cashRegisterShift.model');
const License = require('./license.model');
const FeatureFlag = require('./featureFlag.model');
const FamilyMember = require('./familyMember.model')(sequelize);
const Document = require('./document.model')(sequelize);
const Review = require('./review.model')(sequelize);
const StockMovement = require('./stockMovement.model');

// ── License Relationships ──────────────────────────────────────────
Clinic.hasOne(License, { foreignKey: 'clinicId', as: 'license' });
License.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// ── Clinic Relationships ──────────────────────────────────────────
Clinic.hasMany(Product, { foreignKey: 'clinicId', as: 'products' });
Product.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(User, { foreignKey: 'clinicId', as: 'doctors' });
User.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Invoice, { foreignKey: 'clinicId', as: 'invoices' });
Invoice.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// ── Doctor/Profile Relationships ──────────────────────────────────
User.hasOne(DoctorProfile, { foreignKey: 'userId', as: 'doctorProfile' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Family Relationships ──────────────────────────────────────────
User.hasMany(FamilyMember, { foreignKey: 'primaryUserId', as: 'familyMembers' });
FamilyMember.belongsTo(User, { foreignKey: 'primaryUserId', as: 'primaryUser' });

// ── Appointment Relationships ───────────────────────────────────────
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointmentsAsPatient' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointmentsAsDoctor' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Clinic.hasMany(Appointment, { foreignKey: 'clinicId', as: 'appointments' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// ── Consultation Relationships ────────────────────────────────────
Appointment.hasOne(Consultation, { foreignKey: 'appointmentId', as: 'consultation' });
Consultation.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

User.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultationsAsPatient' });
User.hasMany(Consultation, { foreignKey: 'doctorId', as: 'consultationsAsDoctor' });
Consultation.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Consultation.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Consultation.hasMany(Message, { foreignKey: 'consultationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'availabilities' });
DoctorAvailability.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// ── Invoice Relationships ─────────────────────────────────────────
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Consultation.hasOne(Invoice, { foreignKey: 'consultationId', as: 'invoice' });
Invoice.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Reverse link for CareEpisode.invoiceId (FK lives on CareEpisode, not Invoice —
// invoice.model.js has no careEpisodeId column, so no migration needed here).
Invoice.hasOne(CareEpisode, { foreignKey: 'invoiceId', as: 'careEpisode' });

// ── CareEpisode Relationships ─────────────────────────────────────
CareEpisode.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(CareEpisode, { foreignKey: 'clinicId', as: 'careEpisodes' });

CareEpisode.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
User.hasMany(CareEpisode, { foreignKey: 'patientId', as: 'careEpisodesAsPatient' });

CareEpisode.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(CareEpisode, { foreignKey: 'doctorId', as: 'careEpisodesAsDoctor' });

FamilyMember.hasMany(CareEpisode, { foreignKey: 'familyMemberId', as: 'careEpisodes' });
CareEpisode.belongsTo(FamilyMember, { foreignKey: 'familyMemberId', as: 'familyMember' });

CareEpisode.belongsTo(Appointment, { foreignKey: 'bookingId', as: 'booking' });
CareEpisode.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

CareEpisode.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Prescription link: single source of truth is Prescription.careEpisodeId
// (removed the competing CareEpisode.belongsTo(Prescription, { foreignKey: 'prescriptionId' })
// association — that column still exists on CareEpisode but should be treated as
// unused/legacy going forward to avoid two records disagreeing on the same relationship).
CareEpisode.hasOne(Prescription, { foreignKey: 'careEpisodeId', as: 'prescriptionRecord' });

// ── Prescription Relationships ────────────────────────────────────
Prescription.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(Prescription, { foreignKey: 'clinicId', as: 'prescriptions' });

Prescription.belongsTo(CareEpisode, { foreignKey: 'careEpisodeId', as: 'careEpisode' });

Prescription.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

FamilyMember.hasMany(Prescription, { foreignKey: 'familyMemberId', as: 'prescriptions' });
Prescription.belongsTo(FamilyMember, { foreignKey: 'familyMemberId', as: 'familyMember' });

// ── PrescriptionItem Relationships ────────────────────────────────
PrescriptionItem.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(PrescriptionItem, { foreignKey: 'clinicId', as: 'prescriptionItems' });

PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });

PrescriptionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(PrescriptionItem, { foreignKey: 'productId', as: 'prescriptionItems' });

// ── AuditLog Relationships ────────────────────────────────────────
AuditLog.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(AuditLog, { foreignKey: 'clinicId', as: 'auditLogs' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// ── Inventory relationships ─────────────────────────────────────────
InventoryBatch.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(InventoryBatch, { foreignKey: 'productId', as: 'batches' });
InventoryBatch.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// ── Document Relationships ──────────────────────────────────────────
User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

FamilyMember.hasMany(Document, { foreignKey: 'familyMemberId', as: 'documents' });
Document.belongsTo(FamilyMember, { foreignKey: 'familyMemberId', as: 'familyMember' });

// ── Review Relationships ────────────────────────────────────────────
User.hasMany(Review, { foreignKey: 'doctorId', as: 'reviewsReceived' });
Review.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Review, { foreignKey: 'patientId', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

CareEpisode.hasOne(Review, { foreignKey: 'careEpisodeId', as: 'review' });
Review.belongsTo(CareEpisode, { foreignKey: 'careEpisodeId', as: 'careEpisode' });

// ── Cash Register Relationships ───────────────────────────────────
Clinic.hasMany(CashRegisterShift, { foreignKey: 'clinicId', as: 'cashRegisterShifts' });
CashRegisterShift.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

User.hasMany(CashRegisterShift, { foreignKey: 'userId', as: 'shifts' });
CashRegisterShift.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  DoctorProfile,
  Appointment,
  Consultation,
  Message,
  DoctorAvailability,
  Clinic,
  Invoice,
  InvoiceItem,
  Product,
  CareEpisode,
  Prescription,
  PrescriptionItem,
  AuditLog,
  InventoryBatch,
  CashRegisterShift,
  FamilyMember,
  Document,
  Review,
  StockMovement,
  License,
  FeatureFlag
};