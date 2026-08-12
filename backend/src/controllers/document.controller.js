const { Document, FamilyMember } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.uploadDocument = catchAsync(async (req, res) => {
  const { title, documentType, fileUrl, familyMemberId } = req.body;
  const userId = req.user.id;

  const doc = await Document.create({
    userId,
    familyMemberId: familyMemberId || null,
    title,
    documentType,
    fileUrl
  });

  res.status(201).json({ success: true, data: doc });
});

exports.getDocuments = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const docs = await Document.findAll({
    where: { userId },
    order: [['uploadedAt', 'DESC']],
    include: [{ model: FamilyMember, as: 'familyMember', attributes: ['name', 'relationship'] }]
  });

  res.status(200).json({ success: true, data: docs });
});
