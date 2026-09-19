const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    provider: {
      type: String,
      default: 'mock_gateway',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    details: {
      cardBrand: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
      upiId: { type: String, default: '' },
      paymentChannel: { type: String, default: 'Card/UPI' },
      offlineVerifiedBy: { type: String, default: '' },
      offlineVerifiedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
