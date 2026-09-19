const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the listing'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the item/service'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'Cameras',
        'Books',
        'Tools',
        'Sports',
        'Vehicles',
        'Furniture',
        'Event Equipment',
        'Musical Instruments',
        'Other',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        isMain: { type: Boolean, default: false },
      },
    ],
    pricing: {
      perHour: { type: Number, default: 0 },
      perDay: { type: Number, required: [true, 'Please specify price per day'], min: 0 },
      perWeek: { type: Number, default: 0 },
      securityDeposit: { type: Number, default: 0 },
      lateFeePerDay: { type: Number, default: 0 },
    },
    location: {
      city: { type: String, required: [true, 'City is required'], trim: true },
      area: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
    },
    availability: {
      availableFrom: { type: Date, default: Date.now },
      availableUntil: { type: Date },
      availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '20:00' },
      minDurationHours: { type: Number, default: 1 },
      maxDurationDays: { type: Number, default: 30 },
    },
    rules: {
      pickupOrDelivery: {
        type: String,
        enum: ['pickup', 'delivery', 'both'],
        default: 'pickup',
      },
      cancellationPolicy: {
        type: String,
        default: 'Flexible: Full refund up to 24 hours before pickup.',
      },
      usageInstructions: {
        type: String,
        default: 'Handle with care and return in the same condition as received.',
      },
      condition: {
        type: String,
        enum: ['Brand New', 'Like New', 'Good', 'Fair'],
        default: 'Like New',
      },
      additionalRequirements: {
        type: String,
        default: 'Valid Government ID required during handover.',
      },
    },
    paymentMethods: {
      type: [String],
      enum: ['online', 'offline'],
      default: ['online', 'offline'],
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'unavailable', 'draft'],
      default: 'active',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes for rapid filtering
listingSchema.index({ title: 'text', description: 'text', subcategory: 'text' });
listingSchema.index({ category: 1, 'location.city': 1, 'pricing.perDay': 1 });
listingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
