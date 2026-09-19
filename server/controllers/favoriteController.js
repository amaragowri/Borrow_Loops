const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

// @desc    Toggle favorite on a listing
// @route   POST /api/favorites/:listingId
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      listing: listingId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        isFavorited: false,
        message: 'Removed from your favorites.',
      });
    } else {
      await Favorite.create({
        user: req.user._id,
        listing: listingId,
      });
      return res.json({
        success: true,
        isFavorited: true,
        message: 'Saved to your favorites!',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'listing',
        populate: { path: 'owner', select: 'name avatar location rating' },
      })
      .sort({ createdAt: -1 });

    const listings = favorites
      .filter((fav) => fav.listing) // remove orphaned
      .map((fav) => fav.listing);

    res.json({
      success: true,
      count: listings.length,
      listings,
      favoriteIds: listings.map((l) => l._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
};
