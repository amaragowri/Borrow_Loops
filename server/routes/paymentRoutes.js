const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  recordOfflinePayment,
  verifyOfflinePayment,
  getPaymentByBooking,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/offline', recordOfflinePayment);
router.put('/:id/verify-offline', verifyOfflinePayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;
