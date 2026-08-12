const express = require('express');
const documentController = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', documentController.uploadDocument);
router.get('/', documentController.getDocuments);

module.exports = router;
