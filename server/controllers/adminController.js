const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Report = require('../models/Report');

// @desc    Get platform stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalListings, totalBookings, payments, pendingReports] =
      await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Booking.countDocuments(),
        Payment.find({ status: 'paid' }).select('amount'),
        Report.countDocuments({ status: 'pending' }),
      ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    // Platform revenue is 5% commission
    const platformEarnings = Math.round(totalRevenue * 0.05);

    const activeListings = await Listing.countDocuments({ status: 'active' });
    const activeBookings = await Booking.countDocuments({
      bookingStatus: { $in: ['confirmed', 'active'] },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalBookings,
        activeBookings,
        grossVolume: totalRevenue,
        platformEarnings,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private (Admin)
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin user.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isBlocked ? 'suspended' : 're-activated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for admin
// @route   GET /api/admin/listings
// @access  Private (Admin)
const getAllListingsAdmin = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle listing approval status
// @route   PUT /api/admin/listings/:id/toggle-approval
// @access  Private (Admin)
const toggleListingApproval = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing.isApproved = !listing.isApproved;
    if (!listing.isApproved) {
      listing.status = 'unavailable';
    } else {
      listing.status = 'active';
    }
    await listing.save();

    res.json({
      success: true,
      message: `Listing is now ${listing.isApproved ? 'approved' : 'unapproved'}.`,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a report for a listing
// @route   POST /api/admin/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { listingId, reason, description } = req.body;
    const report = await Report.create({
      reporter: req.user._id,
      listing: listingId,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate({
        path: 'listing',
        populate: { path: 'owner', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Report status updated.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllListingsAdmin,
  toggleListingApproval,
  createReport,
  getReports,
  updateReportStatus,
};
