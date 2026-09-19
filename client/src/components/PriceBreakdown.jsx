import React from 'react';
import { formatCurrency } from '../utils/imageUtils';
import { ShieldCheck, Info } from 'lucide-react';

const PriceBreakdown = ({ calculation, pricingRule }) => {
  if (!calculation) return null;

  const { duration, durationUnit, basePrice, securityDeposit, serviceFee, totalAmount } = calculation;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Price Breakdown
      </h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
          <span>
            {durationUnit === 'hours'
              ? `${formatCurrency(pricingRule?.perHour || Math.round(pricingRule?.perDay / 8))} × ${duration} hrs`
              : `${formatCurrency(pricingRule?.perDay)} × ${duration} days`}
          </span>
          <span className="font-semibold">{formatCurrency(basePrice)}</span>
        </div>

        {serviceFee > 0 && (
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              Platform Service Fee (5%)
              <Info size={12} className="text-slate-400" title="Covers insurance & 24/7 support" />
            </span>
            <span className="font-semibold">{formatCurrency(serviceFee)}</span>
          </div>
        )}

        {securityDeposit > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              Refundable Security Deposit
              <ShieldCheck size={14} />
            </span>
            <span className="font-semibold">{formatCurrency(securityDeposit)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-white">
          <span>Total Payable</span>
          <span className="text-xl text-brand-600 dark:text-brand-400">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {securityDeposit > 0 && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          * Security deposit is 100% refunded to your account once the item is safely returned.
        </p>
      )}
    </div>
  );
};

export default PriceBreakdown;
