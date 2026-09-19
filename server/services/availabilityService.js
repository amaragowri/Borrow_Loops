const Booking = require('../models/Booking');

/**
 * Checks if a listing is available for a specified date/time range.
 * Double-booking is strictly disallowed.
 * Overlap condition:
 * Existing booking matches listing, has active/confirmed/pending status,
 * and requestedStartDate < existing.endDate AND requestedEndDate > existing.startDate.
 */
const checkAvailability = async (listingId, startDate, endDate, excludeBookingId = null) => {
  const reqStart = new Date(startDate);
  const reqEnd = new Date(endDate);

  if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) {
    return {
      available: false,
      reason: 'Invalid start or end date format provided.',
    };
  }

  if (reqStart >= reqEnd) {
    return {
      available: false,
      reason: 'End date must be strictly after the start date.',
    };
  }

  const query = {
    listing: listingId,
    bookingStatus: { $in: ['pending', 'confirmed', 'active'] },
    startDate: { $lt: reqEnd },
    endDate: { $gt: reqStart },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query)
    .select('startDate endDate bookingStatus')
    .lean();

  if (conflictingBookings.length > 0) {
    return {
      available: false,
      reason: 'The item/service is already reserved or booked for the selected date range.',
      conflicts: conflictingBookings,
    };
  }

  return {
    available: true,
    reason: 'Dates are available for booking.',
  };
};

/**
 * Recalculates booking pricing securely on the backend.
 * Never trust frontend price calculations.
 */
const calculatePricing = (listing, startDate, endDate, durationUnit = 'days') => {
  const reqStart = new Date(startDate);
  const reqEnd = new Date(endDate);
  const diffMs = Math.max(0, reqEnd.getTime() - reqStart.getTime());

  let duration;
  let basePrice = 0;

  if (durationUnit === 'hours') {
    const hours = Math.ceil(diffMs / (1000 * 60 * 60)) || 1;
    duration = hours;
    const hourlyRate = listing.pricing.perHour || Math.round(listing.pricing.perDay / 8);
    basePrice = hours * hourlyRate;
  } else {
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
    duration = days;
    if (days >= 7 && listing.pricing.perWeek > 0) {
      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      basePrice = weeks * listing.pricing.perWeek + remDays * listing.pricing.perDay;
    } else {
      basePrice = days * listing.pricing.perDay;
    }
  }

  const securityDeposit = listing.pricing.securityDeposit || 0;
  // Standard 5% platform service fee
  const serviceFee = Math.round(basePrice * 0.05);
  const totalAmount = basePrice + serviceFee + securityDeposit;

  return {
    duration,
    durationUnit,
    basePrice,
    securityDeposit,
    serviceFee,
    totalAmount,
  };
};

module.exports = {
  checkAvailability,
  calculatePricing,
};
