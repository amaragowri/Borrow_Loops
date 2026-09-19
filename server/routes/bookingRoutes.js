const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').post(createBooking);
router.get('/my', getMyBookings);
router.route('/:id').get(getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
