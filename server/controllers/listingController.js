const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const storageService = require('../services/storageService');
const { checkAvailability } = require('../services/availabilityService');

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      pricing,
      location,
      availability,
      rules,
      paymentMethods,
      mainImageIndex,
    } = req.body;

    // Parse nested objects if sent as JSON strings from FormData
    const parsedPricing = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : (availability || {});
    const parsedRules = typeof rules === 'string' ? JSON.parse(rules) : (rules || {});
    const parsedPaymentMethods = typeof paymentMethods === 'string' ? JSON.parse(paymentMethods) : (paymentMethods || ['online', 'offline']);

    // Process uploaded files
    const images = [];
    const mainIdx = parseInt(mainImageIndex, 10) || 0;

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, idx) => {
        const isMain = idx === mainIdx;
        const imgObj = storageService.processUploadedFile(file, isMain);
        if (imgObj) images.push(imgObj);
      });
    }

    // Support external image URLs if provided (for flexibility or sample creation)
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
      urls.forEach((url, idx) => {
        images.push({
          url,
          publicId: `external_${Date.now()}_${idx}`,
          isMain: images.length === 0 && idx === 0,
        });
      });
    }

    if (images.length === 0) {
      // Fallback default image for safety
      images.push({
        url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        publicId: 'default_listing',
        isMain: true,
      });
    }

    // Ensure exactly one main image
    const hasMain = images.some((img) => img.isMain);
    if (!hasMain && images.length > 0) {
      images[0].isMain = true;
    }

    const listing = await Listing.create({
      owner: req.user._id,
      title,
      description,
      category,
      subcategory: subcategory || '',
      images,
      pricing: {
        perHour: Number(parsedPricing.perHour) || 0,
        perDay: Number(parsedPricing.perDay) || 0,
        perWeek: Number(parsedPricing.perWeek) || 0,
        securityDeposit: Number(parsedPricing.securityDeposit) || 0,
        lateFeePerDay: Number(parsedPricing.lateFeePerDay) || 0,
      },
      location: {
        city: parsedLocation.city || 'Bengaluru',
        area: parsedLocation.area || '',
        address: parsedLocation.address || '',
        zipCode: parsedLocation.zipCode || '',
      },
      availability: {
        availableFrom: parsedAvailability.availableFrom || Date.now(),
        availableUntil: parsedAvailability.availableUntil || null,
        availableDays: parsedAvailability.availableDays || [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        startTime: parsedAvailability.startTime || '08:00',
        endTime: parsedAvailability.endTime || '20:00',
        minDurationHours: Number(parsedAvailability.minDurationHours) || 1,
        maxDurationDays: Number(parsedAvailability.maxDurationDays) || 30,
      },
      rules: {
        pickupOrDelivery: parsedRules.pickupOrDelivery || 'pickup',
        cancellationPolicy: parsedRules.cancellationPolicy || 'Flexible: Full refund up to 24 hours before pickup.',
        usageInstructions: parsedRules.usageInstructions || 'Handle with care.',
        condition: parsedRules.condition || 'Like New',
        additionalRequirements: parsedRules.additionalRequirements || 'Valid Government ID required during handover.',
      },
      paymentMethods: parsedPaymentMethods,
      status: 'active',
    });

    const populatedListing = await Listing.findById(listing._id).populate(
      'owner',
      'name avatar rating ratingsCount phone location'
    );

    res.status(201).json({
      success: true,
      message: 'Listing published successfully!',
      listing: populatedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings with filtering, search, sorting & pagination
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      rating,
      paymentMethod,
      owner,
      status,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by active status by default unless owner is querying
    if (status) {
      query.status = status;
    } else if (!owner) {
      query.status = 'active';
    }

    if (owner) {
      query.owner = owner;
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (city && city !== 'All') {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (condition && condition !== 'All') {
      query['rules.condition'] = condition;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethods = paymentMethod;
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (minPrice || maxPrice) {
      query['pricing.perDay'] = {};
      if (minPrice) query['pricing.perDay'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.perDay'].$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { subcategory: { $regex: search.trim(), $options: 'i' } },
        { 'location.city': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'pricing.perDay': 1 };
    else if (sort === 'price_desc') sortOptions = { 'pricing.perDay': -1 };
    else if (sort === 'rating') sortOptions = { rating: -1, reviewsCount: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('owner', 'name avatar rating ratingsCount phone location')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: listings.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing details
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email phone avatar rating ratingsCount location bio createdAt');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Fetch existing active bookings for availability visualization
    const activeBookings = await Booking.find({
      listing: listing._id,
      bookingStatus: { $in: ['pending', 'confirmed', 'active'] },
    })
      .select('startDate endDate startTime endTime bookingStatus')
      .lean();

    res.json({
      success: true,
      listing,
      bookedRanges: activeBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Owner or Admin)
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this listing.' });
    }

    const {
      title,
      description,
      category,
      subcategory,
      pricing,
      location,
      availability,
      rules,
      paymentMethods,
      status,
      removedPublicIds,
      mainImageIndex,
    } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (subcategory !== undefined) listing.subcategory = subcategory;
    if (status) listing.status = status;

    if (pricing) {
      const p = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
      listing.pricing = { ...listing.pricing.toObject(), ...p };
    }

    if (location) {
      const loc = typeof location === 'string' ? JSON.parse(location) : location;
      listing.location = { ...listing.location.toObject(), ...loc };
    }

    if (availability) {
      const av = typeof availability === 'string' ? JSON.parse(availability) : availability;
      listing.availability = { ...listing.availability.toObject(), ...av };
    }

    if (rules) {
      const r = typeof rules === 'string' ? JSON.parse(rules) : rules;
      listing.rules = { ...listing.rules.toObject(), ...r };
    }

    if (paymentMethods) {
      listing.paymentMethods = typeof paymentMethods === 'string' ? JSON.parse(paymentMethods) : paymentMethods;
    }

    // Handle image removals
    if (removedPublicIds) {
      const idsToRemove = typeof removedPublicIds === 'string' ? JSON.parse(removedPublicIds) : removedPublicIds;
      idsToRemove.forEach((publicId) => {
        storageService.deleteFile(publicId, 'listings');
        listing.images = listing.images.filter((img) => img.publicId !== publicId);
      });
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const imgObj = storageService.processUploadedFile(file, false);
        if (imgObj) listing.images.push(imgObj);
      });
    }

    // Set designated main image
    if (mainImageIndex !== undefined) {
      const mIdx = parseInt(mainImageIndex, 10);
      listing.images.forEach((img, idx) => {
        img.isMain = idx === mIdx;
      });
    } else if (!listing.images.some((img) => img.isMain) && listing.images.length > 0) {
      listing.images[0].isMain = true;
    }

    await listing.save();

    res.json({
      success: true,
      message: 'Listing updated successfully!',
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner or Admin)
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    // Clean up local media files
    listing.images.forEach((img) => {
      if (img.publicId && !img.publicId.startsWith('default') && !img.publicId.startsWith('external')) {
        storageService.deleteFile(img.publicId, 'listings');
      }
    });

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing removed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check availability for a listing
// @route   GET /api/listings/:id/availability
// @access  Public
const getListingAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      // Return list of all active booked ranges
      const bookedRanges = await Booking.find({
        listing: req.params.id,
        bookingStatus: { $in: ['pending', 'confirmed', 'active'] },
      })
        .select('startDate endDate startTime endTime bookingStatus')
        .lean();

      return res.json({
        success: true,
        bookedRanges,
      });
    }

    const availabilityResult = await checkAvailability(req.params.id, startDate, endDate);
    res.json({
      success: true,
      ...availabilityResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingAvailability,
};
