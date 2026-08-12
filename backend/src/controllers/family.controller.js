const { FamilyMember } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const createFamilyMember = catchAsync(async (req, res) => {
  const { name, relationship, dateOfBirth, gender, bloodGroup, allergies, medicalHistory } = req.body;
  const primaryUserId = req.user.id;

  if (!name || !relationship) {
    throw new ApiError(400, 'Name and relationship are required.');
  }

  const member = await FamilyMember.create({
    primaryUserId,
    name,
    relationship,
    dateOfBirth: dateOfBirth || null,
    gender: gender || null,
    bloodGroup: bloodGroup || null,
    allergies: allergies || null,
    medicalHistory: medicalHistory || null
  });

  res.status(201).json({ success: true, data: member });
});

const getFamilyMembers = catchAsync(async (req, res) => {
  const primaryUserId = req.user.id;
  const members = await FamilyMember.findAll({
    where: { primaryUserId },
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json({ success: true, data: members });
});

const updateFamilyMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const primaryUserId = req.user.id;

  const member = await FamilyMember.findOne({ where: { id, primaryUserId } });
  if (!member) {
    throw new ApiError(404, 'Family member not found');
  }

  const updates = req.body;
  
  // Prevent changing the owner
  delete updates.primaryUserId;
  delete updates.id;

  await member.update(updates);

  res.status(200).json({ success: true, data: member });
});

const deleteFamilyMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const primaryUserId = req.user.id;

  const member = await FamilyMember.findOne({ where: { id, primaryUserId } });
  if (!member) {
    throw new ApiError(404, 'Family member not found');
  }

  await member.destroy();

  res.status(200).json({ success: true, message: 'Family member removed successfully' });
});

module.exports = {
  createFamilyMember,
  getFamilyMembers,
  updateFamilyMember,
  deleteFamilyMember
};
