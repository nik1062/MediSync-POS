const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth.middleware');
const requireFeature = require('../middleware/featureGate.middleware');

router.use(authenticate);
router.use(requireFeature('pharmacy_module', 'PRO'));

router.get('/search', productController.searchProducts);

module.exports = router;
