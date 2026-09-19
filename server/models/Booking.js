const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String,
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '18:00',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'days',
    },
    pricing: {
      basePrice: { type: Number, required: true },
      securityDeposit: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'offline_pending', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    handoverNotes: {
      type: String,
      default: '',
    },
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ listing: 1, startDate: 1, endDate: 1, bookingStatus: 1 });
bookingSchema.index({ borrower: 1, bookingStatus: 1 });
bookingSchema.index({ lender: 1, bookingStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
