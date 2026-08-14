const express = require('express');
const protect = require('../middleware/auth.middleware');
const familyController = require('../controllers/family.controller');

const router = express.Router();

router.use(protect); // All family routes require authentication

router.post('/', familyController.createFamilyMember);
router.get('/', familyController.getFamilyMembers);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.deleteFamilyMember);

module.exports = router;
