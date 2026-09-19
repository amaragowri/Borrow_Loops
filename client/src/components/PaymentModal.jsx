import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/imageUtils';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { showToast } = useNotifications();
  const [methodTab, setMethodTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states for simulation
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Gowri Shankar');
  const [upiId, setUpiId] = useState('gowri@okaxis');

  if (!isOpen || !booking) return null;

  const totalAmount = booking.pricing?.totalAmount || 0;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleOnlinePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Initialize payment order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      // Simulate network latency for payment gateway
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 2. Verify payment
      const verifyRes = await api.post('/payments/verify', {
        bookingId: booking._id,
        orderId: orderRes.data.order?.orderId || 'order_mock_123',
        paymentId: `pay_${Date.now()}`,
        cardDetails: {
          brand: 'Visa',
          last4: cardNumber.slice(-4) || '4242',
        },
        upiId: methodTab === 'upi' ? upiId : '',
      });

      if (verifyRes.data.success) {
        setIsSuccess(true);
        triggerConfetti();
        showToast('Payment successful! Your booking is confirmed.', 'success');
        setTimeout(() => {
          onSuccess(verifyRes.data.booking);
        }, 1200);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOfflinePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await api.post('/payments/offline', {
        bookingId: booking._id,
      });

      if (res.data.success) {
        setIsSuccess(true);
        showToast('Offline payment recorded! You can settle payment with the lender on handover.', 'info');
        setTimeout(() => {
          onSuccess(res.data.booking);
        }, 1200);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record offline payment', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Complete Payment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              BorrowLoop Secure Gateway Simulation
            </p>
          </div>
          {!isProcessing && !isSuccess && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Payment Confirmed!
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your reservation is confirmed. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Order Summary Pill */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Item</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">
                    {booking.listing?.title || 'Listing item'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Amount Due</p>
                  <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethodTab('card')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition ${
                    methodTab === 'card'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-400/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethodTab('upi')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition ${
                    methodTab === 'upi'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-400/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Smartphone size={18} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethodTab('offline')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition ${
                    methodTab === 'offline'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-400/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building size={18} />
                  <span>Pay Offline</span>
                </button>
              </div>

              {/* Card Form */}
              {methodTab === 'card' && (
                <form onSubmit={handleOnlinePayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing Secure Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay {formatCurrency(totalAmount)}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* UPI Form */}
              {methodTab === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okbank"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Or scan simulated QR using GPay, PhonePe, or Paytm
                    </p>
                  </div>

                  <button
                    onClick={handleOnlinePayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Verifying UPI Transaction...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay via UPI {formatCurrency(totalAmount)}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Offline Payment Flow */}
              {methodTab === 'offline' && (
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                    <p className="font-bold">Offline Handover Payment Terms:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      <li>You will pay cash or transfer directly to the lender upon in-person handover.</li>
                      <li>Booking status will be "Pending Confirmation" until the lender verifies.</li>
                      <li>Security deposit and ID verification must take place during pickup.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleOfflinePayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Recording Offline Request...</span>
                      </>
                    ) : (
                      <span>Confirm Offline Booking</span>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>256-bit Encrypted. Simulated Test Environment.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
