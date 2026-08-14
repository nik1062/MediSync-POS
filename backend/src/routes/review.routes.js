const express = require('express');
const reviewController = require('../controllers/review.controller');
const protect = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, reviewController.submitReview);
router.get('/:doctorId', reviewController.getDoctorReviews);

module.exports = router;
