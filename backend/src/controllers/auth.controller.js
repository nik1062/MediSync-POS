const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: user });
});

const toggleOnlineStatus = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isOnline = !user.isOnline;
  await user.save();
  res.status(200).json({ success: true, data: { isOnline: user.isOnline } });
});

module.exports = { register, login, getProfile, toggleOnlineStatus };
