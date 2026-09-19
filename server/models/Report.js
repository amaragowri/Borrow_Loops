const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Inappropriate Content', 'Misleading Information', 'Damaged/Defective', 'Fraud/Scam', 'Other'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
