const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

// @desc    Get public user profile & their listings
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name avatar location bio rating ratingsCount createdAt role'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const listings = await Listing.find({ owner: user._id, status: 'active' }).select(
      'title category pricing images rating reviewsCount location rules'
    );

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user,
      listings,
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
