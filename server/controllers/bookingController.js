const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { checkAvailability, calculatePricing } = require('../services/availabilityService');

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      listingId,
      startDate,
      endDate,
      startTime,
      endTime,
      durationUnit = 'days',
      paymentMethod = 'online',
      handoverNotes,
    } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, start date, and end date are required.',
      });
    }

    const listing = await Listing.findById(listingId).populate('owner');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot borrow your own listing.',
      });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This listing is currently not accepting new bookings.',
      });
    }

    // STRICT SERVER-SIDE AVAILABILITY CHECK
    const availCheck = await checkAvailability(listingId, startDate, endDate);
    if (!availCheck.available) {
      return res.status(409).json({
        success: false,
        message: availCheck.reason || 'Selected dates/times are unavailable.',
      });
    }

    // STRICT SERVER-SIDE PRICING RECALCULATION
    const calculated = calculatePricing(listing, startDate, endDate, durationUnit);

    const booking = await Booking.create({
      borrower: req.user._id,
      lender: listing.owner._id,
      listing: listing._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || '09:00',
      endTime: endTime || '18:00',
      duration: calculated.duration,
      durationUnit: calculated.durationUnit,
      pricing: {
        basePrice: calculated.basePrice,
        securityDeposit: calculated.securityDeposit,
        serviceFee: calculated.serviceFee,
        totalAmount: calculated.totalAmount,
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'offline' ? 'offline_pending' : 'pending',
      bookingStatus: 'pending',
      handoverNotes: handoverNotes || '',
    });

    // Notify lender about new booking request
    await Notification.create({
      recipient: listing.owner._id,
      sender: req.user._id,
      title: 'New Booking Request Received',
      message: `${req.user.name} has requested to borrow "${listing.title}" for ${calculated.duration} ${calculated.durationUnit}.`,
      type: 'booking_request',
      link: `/dashboard?tab=lender`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('listing')
      .populate('borrower', 'name email phone avatar')
      .populate('lender', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings (as borrower or as lender)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { role = 'borrower', status } = req.query;

    const query = {};
    if (role === 'lender') {
      query.lender = req.user._id;
    } else {
      query.borrower = req.user._id;
    }

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('listing')
      .populate('borrower', 'name email phone avatar rating')
      .populate('lender', 'name email phone avatar rating')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('borrower', 'name email phone avatar rating bio')
      .populate('lender', 'name email phone avatar rating bio');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAuthorized =
      booking.borrower._id.toString() === req.user._id.toString() ||
      booking.lender._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking.' });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (approve, reject, active, complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Lender or Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['confirmed', 'rejected', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status update requested.' });
    }

    const booking = await Booking.findById(req.params.id).populate('listing').populate('borrower');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isLender = booking.lender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLender && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the listing lender or admin can update booking progress.' });
    }

    booking.bookingStatus = status;
    if (reason) {
      booking.cancellationReason = reason;
    }

    // If lender completes and offline payment was pending, auto-mark paid
    if (status === 'completed' && booking.paymentStatus === 'offline_pending') {
      booking.paymentStatus = 'paid';
    }

    await booking.save();

    // Notify borrower of status change
    let notificationTitle = 'Booking Status Update';
    let notificationMsg = `Your booking for "${booking.listing.title}" is now ${status}.`;

    if (status === 'confirmed') {
      notificationTitle = 'Booking Request Approved! 🎉';
      notificationMsg = `Good news! Your booking for "${booking.listing.title}" has been confirmed by the lender.`;
    } else if (status === 'rejected') {
      notificationTitle = 'Booking Request Declined';
      notificationMsg = `Your booking request for "${booking.listing.title}" was declined. ${reason ? 'Reason: ' + reason : ''}`;
    } else if (status === 'active') {
      notificationTitle = 'Item Handed Over (Rental Active)';
      notificationMsg = `Your rental for "${booking.listing.title}" is now active. Enjoy your borrowing period!`;
    } else if (status === 'completed') {
      notificationTitle = 'Booking Completed – Leave a Review';
      notificationMsg = `Your rental for "${booking.listing.title}" is completed. How was your experience? Leave a review!`;
    }

    await Notification.create({
      recipient: booking.borrower._id,
      sender: req.user._id,
      title: notificationTitle,
      message: notificationMsg,
      type: status === 'confirmed' ? 'booking_confirmed' : status === 'rejected' ? 'booking_rejected' : 'booking_completed',
      link: `/dashboard?tab=borrower`,
    });

    res.json({
      success: true,
      message: `Booking has been marked as ${status}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private (Borrower or Lender)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isBorrower = booking.borrower.toString() === req.user._id.toString();
    const isLender = booking.lender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBorrower && !isLender && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    if (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.bookingStatus} booking.` });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    // Send notification to the counter-party
    const recipientId = isBorrower ? booking.lender : booking.borrower;
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      title: 'Booking Cancelled',
      message: `Booking for "${booking.listing.title}" was cancelled. Reason: ${reason || 'Not specified'}.`,
      type: 'system',
      link: `/dashboard`,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
