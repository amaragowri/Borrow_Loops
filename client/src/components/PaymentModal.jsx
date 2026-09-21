import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../utils/imageUtils';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { showToast } = useNotifications();
  const [methodTab, setMethodTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Form states for test simulation
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Gowri Shankar');
  const [upiId, setUpiId] = useState('gowri@okaxis');

  if (!isOpen || !booking) return null;

  const totalAmount = booking.pricing?.totalAmount || 0;
  const basePrice = booking.pricing?.basePrice || 0;
  const serviceFee = booking.pricing?.serviceFee || 0;
  const securityDeposit = booking.pricing?.securityDeposit || 0;
  const duration = booking.duration || 1;
  const durationUnit = booking.durationUnit || 'days';

  const handleOnlinePayment = async (e) => {
    if (e) e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Initialize payment order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      // Simulated network transit delay for gateway confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        const resultBooking = verifyRes.data.booking || booking;
        setConfirmedBooking(resultBooking);
        setIsSuccess(true);
        showToast('Payment successful! Your booking is confirmed.', 'success');
      } else {
        setPaymentError(verifyRes.data.message || 'Payment could not be verified.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Unable to complete transaction. Please try again.';
      setPaymentError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOfflinePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await api.post('/payments/offline', {
        bookingId: booking._id,
      });

      if (res.data.success) {
        const resultBooking = res.data.booking || booking;
        setConfirmedBooking(resultBooking);
        setIsSuccess(true);
        showToast('Offline booking recorded! Settle payment with the lender on handover.', 'info');
      } else {
        setPaymentError(res.data.message || 'Failed to record offline booking.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to record offline payment';
      setPaymentError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessRedirect = () => {
    onClose();
    if (onSuccess) {
      onSuccess(confirmedBooking || booking);
    }
  };

  const displayBookingId = confirmedBooking?._id
    ? `BL-${String(confirmedBooking._id).slice(-6).toUpperCase()}`
    : `BL-${String(booking._id).slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 modal-backdrop-animate overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl modal-content-animate my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                BorrowLoop Checkout
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Encrypted Peer-to-Peer Payment
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* 1. SUCCESS STATE */}
          {isSuccess ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md animate-checkmark-pop">
                <CheckCircle2 size={44} />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Payment Successful!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your gear reservation has been confirmed with the lender.
                </p>
              </div>

              {/* Booking Reference Pill */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/60 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Booking Reference</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {displayBookingId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Item</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {booking.listing?.title || 'Gear Reservation'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Total Paid / Settle</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSuccessRedirect}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 btn-interactive"
              >
                <span>Go to My Bookings</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : paymentError ? (
            /* 2. FAILURE STATE */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-sm">
                <AlertCircle size={36} />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Payment Failed
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">
                  {paymentError}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentError(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Change Payment Method
                </button>
                <button
                  type="button"
                  onClick={methodTab === 'offline' ? handleOfflinePayment : handleOnlinePayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-1.5 btn-interactive"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          ) : (
            /* 3. NORMAL CHECKOUT FORM */
            <div className="space-y-5">
              {/* Order Breakdown Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Gear Item</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                    {booking.listing?.title || 'Listing item'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Rental ({duration} {durationUnit})</span>
                  <span>{formatCurrency(basePrice)}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Platform Fee (5%)</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                )}
                {securityDeposit > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span>Refundable Deposit</span>
                    <span>{formatCurrency(securityDeposit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Total Payable
                  </span>
                  <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethodTab('card')}
                    disabled={isProcessing}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                      methodTab === 'card'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 ring-2 ring-brand-400/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard size={18} className={methodTab === 'card' ? 'text-brand-600 dark:text-brand-400' : ''} />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethodTab('upi')}
                    disabled={isProcessing}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                      methodTab === 'upi'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 ring-2 ring-brand-400/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone size={18} className={methodTab === 'upi' ? 'text-brand-600 dark:text-brand-400' : ''} />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethodTab('offline')}
                    disabled={isProcessing}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                      methodTab === 'offline'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 ring-2 ring-brand-400/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building size={18} className={methodTab === 'offline' ? 'text-brand-600 dark:text-brand-400' : ''} />
                    <span>Pay on Pickup</span>
                  </button>
                </div>
              </div>

              {/* Card Form */}
              {methodTab === 'card' && (
                <form onSubmit={handleOnlinePayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        disabled={isProcessing}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        disabled={isProcessing}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 btn-interactive"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis"
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-center border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Supports Google Pay, PhonePe, Paytm, BHIM & all major UPI apps.
                  </div>

                  <button
                    type="button"
                    onClick={handleOnlinePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 btn-interactive"
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
                  <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>🤝 Handover & Settle Terms:</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      <li>Pay directly to the lender upon inspecting equipment in person.</li>
                      <li>Security deposit is held or settled mutually during handover.</li>
                      <li>Booking request is dispatched to the lender immediately.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleOfflinePayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 btn-interactive"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <span>Confirm Offline Reservation</span>
                    )}
                  </button>
                </div>
              )}

              {/* Trust Section */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>🔒 Secure Payment • Protected Peer-to-Peer Transaction</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
