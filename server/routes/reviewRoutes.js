const express = require('express');
const router = express.Router();
const {
  createReview,
  getListingReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:id/reviews', getListingReviews);
router.post('/', protect, createReview);

module.exports = router;
