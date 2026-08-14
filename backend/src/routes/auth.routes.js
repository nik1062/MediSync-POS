const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerRules, loginRules } = require('../utils/validators');
const protect = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/toggle-online', protect, authController.toggleOnlineStatus);

module.exports = router;
