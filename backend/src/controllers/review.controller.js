const { Review, CareEpisode } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.submitReview = catchAsync(async (req, res) => {
  const { doctorId, careEpisodeId, rating, comment } = req.body;
  const patientId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  // Ensure this patient actually had this episode
  const episode = await CareEpisode.findOne({ where: { id: careEpisodeId, patientId, doctorId } });
  if (!episode) {
    return res.status(403).json({ success: false, message: 'Care episode not found or not owned by you.' });
  }

  const review = await Review.create({
    doctorId,
    patientId,
    careEpisodeId,
    rating,
    comment
  });

  res.status(201).json({ success: true, data: review });
});

exports.getDoctorReviews = catchAsync(async (req, res) => {
  const doctorId = req.params.doctorId;
  const reviews = await Review.findAll({
    where: { doctorId },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({ success: true, data: reviews });
});
