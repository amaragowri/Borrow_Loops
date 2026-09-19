const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Prevents duplicate reviews for the same booking
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please give a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ listing: 1 });
reviewSchema.index({ reviewer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
