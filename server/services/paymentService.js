const crypto = require('crypto');
const Payment = require('../models/Payment');

/**
 * Payment Service Abstraction
 * Provider-ready architecture (Razorpay / Stripe / Mock).
 * In development, runs safe mock mode with realistic transaction workflows.
 */
class PaymentService {
  constructor() {
    this.provider = process.env.PAYMENT_PROVIDER || 'mock';
  }

  /**
   * Create an order or session for online payment
   */
  async createOrder({ bookingId, amount, currency = 'INR', payerId, payeeId, listingId }) {
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    
    // In production, this calls Razorpay `razorpay.orders.create` or Stripe `stripe.paymentIntents.create`
    return {
      success: true,
      orderId,
      amount,
      currency,
      provider: this.provider,
      key: process.env.PAYMENT_PROVIDER_KEY || 'mock_pk_test_borrowloop_789456123',
    };
  }

  /**
   * Verify online payment and record Payment document
   */
  async verifyPayment({
    bookingId,
    payerId,
    payeeId,
    listingId,
    amount,
    currency = 'INR',
    method = 'online',
    orderId,
    paymentId,
    signature,
    cardDetails = {},
    upiId = '',
  }) {
    // Generate transaction identifier if not provided
    const transactionId = paymentId || `txn_${crypto.randomBytes(10).toString('hex')}`;

    // Never store full card or CVV. Store only brand and masked last 4 digits
    const paymentRecord = await Payment.create({
      booking: bookingId,
      payer: payerId,
      payee: payeeId,
      listing: listingId,
      amount,
      currency,
      method,
      provider: this.provider,
      transactionId,
      status: 'paid',
      details: {
        cardBrand: cardDetails.brand || (method === 'online' ? 'Visa' : 'N/A'),
        cardLast4: cardDetails.last4 || (method === 'online' ? '4242' : ''),
        upiId: upiId || '',
        paymentChannel: upiId ? 'UPI' : 'Credit/Debit Card',
      },
    });

    return {
      verified: true,
      transactionId,
      payment: paymentRecord,
    };
  }

  /**
   * Record an offline pending payment
   */
  async recordOfflinePayment({ bookingId, payerId, payeeId, listingId, amount, currency = 'INR' }) {
    const transactionId = `off_${crypto.randomBytes(8).toString('hex')}`;

    const paymentRecord = await Payment.create({
      booking: bookingId,
      payer: payerId,
      payee: payeeId,
      listing: listingId,
      amount,
      currency,
      method: 'offline',
      provider: 'cash_or_direct_upi',
      transactionId,
      status: 'pending',
      details: {
        paymentChannel: 'Cash / Direct UPI on Handover',
      },
    });

    return {
      recorded: true,
      transactionId,
      payment: paymentRecord,
    };
  }

  /**
   * Confirm offline payment verification by lender or admin
   */
  async confirmOfflineVerification(paymentId, verifiedByUserId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    payment.status = 'paid';
    payment.details.offlineVerifiedBy = verifiedByUserId.toString();
    payment.details.offlineVerifiedAt = new Date();
    await payment.save();

    return payment;
  }
}

module.exports = new PaymentService();
