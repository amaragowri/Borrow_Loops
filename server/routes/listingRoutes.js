const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingAvailability,
} = require('../controllers/listingController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Support up to 8 images per listing upload
router
  .route('/')
  .get(optionalAuth, getListings)
  .post(protect, upload.array('images', 8), createListing);

router.get('/:id/availability', getListingAvailability);

router
  .route('/:id')
  .get(getListingById)
  .put(protect, upload.array('images', 8), updateListing)
  .delete(protect, deleteListing);

module.exports = router;
