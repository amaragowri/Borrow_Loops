const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const paymentService = require('../services/paymentService');

// @desc    Initialize payment order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this booking.' });
    }

    const orderData = await paymentService.createOrder({
      bookingId: booking._id,
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      payerId: req.user._id,
      payeeId: booking.lender,
      listingId: booking.listing._id,
    });

    res.json({
      success: true,
      order: orderData,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify online payment & update booking
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, orderId, paymentId, cardDetails, upiId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Process payment verification via service
    const verification = await paymentService.verifyPayment({
      bookingId: booking._id,
      payerId: req.user._id,
      payeeId: booking.lender,
      listingId: booking.listing._id,
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      method: 'online',
      orderId,
      paymentId,
      cardDetails,
      upiId,
    });

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed'; // Auto-confirm upon verified payment
    await booking.save();

    // Notify lender that payment is received and booking is confirmed
    await Notification.create({
      recipient: booking.lender,
      sender: req.user._id,
      title: 'Payment Received & Booking Confirmed',
      message: `Payment of ₹${booking.pricing.totalAmount} for "${booking.listing.title}" was verified online. Booking is now confirmed!`,
      type: 'payment_received',
      link: `/dashboard?tab=lender`,
    });

    res.json({
      success: true,
      message: 'Payment completed successfully!',
      transactionId: verification.transactionId,
      payment: verification.payment,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record offline payment request
// @route   POST /api/payments/offline
// @access  Private
const recordOfflinePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const offlineRecord = await paymentService.recordOfflinePayment({
      bookingId: booking._id,
      payerId: req.user._id,
      payeeId: booking.lender,
      listingId: booking.listing._id,
      amount: booking.pricing.totalAmount,
    });

    booking.paymentMethod = 'offline';
    booking.paymentStatus = 'offline_pending';
    await booking.save();

    await Notification.create({
      recipient: booking.lender,
      sender: req.user._id,
      title: 'Offline Payment Selected',
      message: `${req.user.name} chose to pay ₹${booking.pricing.totalAmount} offline upon handover for "${booking.listing.title}".`,
      type: 'payment_pending',
      link: `/dashboard?tab=lender`,
    });

    res.json({
      success: true,
      message: 'Offline payment option recorded. Please pay the lender upon receiving the item.',
      payment: offlineRecord.payment,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lender verifies offline payment
// @route   PUT /api/payments/:id/verify-offline
// @access  Private (Lender or Admin)
const verifyOfflinePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const isPayee = payment.payee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPayee && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this payment.' });
    }

    await paymentService.confirmOfflineVerification(payment._id, req.user._id);

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      await booking.save();

      await Notification.create({
        recipient: booking.borrower,
        sender: req.user._id,
        title: 'Offline Payment Confirmed',
        message: `Your offline payment of ₹${payment.amount} has been confirmed by the lender.`,
        type: 'payment_received',
        link: `/dashboard?tab=borrower`,
      });
    }

    res.json({
      success: true,
      message: 'Offline payment verified successfully!',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt for booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar')
      .populate('listing', 'title images');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  recordOfflinePayment,
  verifyOfflinePayment,
  getPaymentByBooking,
};
