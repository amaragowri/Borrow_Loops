const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create review for completed booking
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, photos } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, rating (1-5), and comments are required.',
      });
    }

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the borrower can leave a review.' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted once the borrowing period is completed.',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    const review = await Review.create({
      booking: bookingId,
      listing: booking.listing._id,
      reviewer: req.user._id,
      reviewee: booking.lender,
      rating: Number(rating),
      comment,
      photos: photos || [],
    });

    booking.reviewSubmitted = true;
    await booking.save();

    // Recalculate Listing Rating
    const listingReviews = await Review.find({ listing: booking.listing._id });
    const avgListingRating =
      listingReviews.reduce((sum, item) => sum + item.rating, 0) / listingReviews.length;

    await Listing.findByIdAndUpdate(booking.listing._id, {
      rating: Number(avgListingRating.toFixed(1)),
      reviewsCount: listingReviews.length,
    });

    // Recalculate Lender Rating
    const lenderReviews = await Review.find({ reviewee: booking.lender });
    const avgLenderRating =
      lenderReviews.reduce((sum, item) => sum + item.rating, 0) / lenderReviews.length;

    await User.findByIdAndUpdate(booking.lender, {
      rating: Number(avgLenderRating.toFixed(1)),
      ratingsCount: lenderReviews.length,
    });

    // Notify lender of new review
    await Notification.create({
      recipient: booking.lender,
      sender: req.user._id,
      title: 'New Review Received! ⭐',
      message: `${req.user.name} gave your listing "${booking.listing.title}" a ${rating}-star rating.`,
      type: 'review_received',
      link: `/listing/${booking.listing._id}`,
    });

    const populatedReview = await Review.findById(review._id).populate(
      'reviewer',
      'name avatar location'
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a listing
// @route   GET /api/listings/:id/reviews
// @access  Public
const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.id })
      .populate('reviewer', 'name avatar location createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getListingReviews,
};
