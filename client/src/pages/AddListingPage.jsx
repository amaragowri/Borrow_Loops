import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ImageUpload from '../components/ImageUpload';
import { CATEGORIES, CITIES, CONDITIONS } from '../utils/constants';

const AddListingPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cameras');
  const [subcategory, setSubcategory] = useState('');

  // Pricing
  const [perDay, setPerDay] = useState('');
  const [perHour, setPerHour] = useState('');
  const [perWeek, setPerWeek] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [lateFeePerDay, setLateFeePerDay] = useState('');

  // Availability
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [minDurationHours, setMinDurationHours] = useState('4');
  const [maxDurationDays, setMaxDurationDays] = useState('30');

  // Location
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');

  // Rules
  const [condition, setCondition] = useState('Like New');
  const [pickupOrDelivery, setPickupOrDelivery] = useState('pickup');
  const [cancellationPolicy, setCancellationPolicy] = useState('Flexible: Full refund up to 24 hours before pickup.');
  const [usageInstructions, setUsageInstructions] = useState('Handle with care and return in original condition.');
  const [additionalRequirements, setAdditionalRequirements] = useState('Valid Government ID required during handover.');

  // Payment Methods
  const [acceptOnline, setAcceptOnline] = useState(true);
  const [acceptOffline, setAcceptOffline] = useState(true);

  // Images state
  const [files, setFiles] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !perDay || !city) {
      showToast('Please fill in all required fields (title, description, price, city).', 'error');
      return;
    }

    if (files.length === 0) {
      showToast('Please upload at least 1 photo of your item.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subcategory', subcategory);

      formData.append(
        'pricing',
        JSON.stringify({
          perDay: Number(perDay),
          perHour: Number(perHour) || 0,
          perWeek: Number(perWeek) || 0,
          securityDeposit: Number(securityDeposit) || 0,
          lateFeePerDay: Number(lateFeePerDay) || 0,
        })
      );

      formData.append(
        'location',
        JSON.stringify({
          city,
          area,
          address,
        })
      );

      formData.append(
        'availability',
        JSON.stringify({
          availableFrom,
          startTime,
          endTime,
          minDurationHours: Number(minDurationHours) || 1,
          maxDurationDays: Number(maxDurationDays) || 30,
        })
      );

      formData.append(
        'rules',
        JSON.stringify({
          condition,
          pickupOrDelivery,
          cancellationPolicy,
          usageInstructions,
          additionalRequirements,
        })
      );

      const paymentMethods = [];
      if (acceptOnline) paymentMethods.push('online');
      if (acceptOffline) paymentMethods.push('offline');
      formData.append('paymentMethods', JSON.stringify(paymentMethods));

      formData.append('mainImageIndex', mainIndex.toString());

      // Append uploaded image files
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        showToast('Listing published successfully! ✨', 'success');
        navigate(`/listing/${res.data.listing._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-600 to-indigo-700 text-white space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
            <PlusCircle size={14} /> Lend Gear & Earn
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            List an Item or Service
          </h1>
          <p className="text-sm text-brand-100 max-w-xl">
            Share your unused items with borrowers in your neighborhood. Set your own prices, rules, and availability.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Basic Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony A7IV Camera with 24-70mm GM Lens"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subcategory / Model
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Mirrorless Cameras, Power Drills"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description & What's Included *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item, accessories included, ideal use cases, and tips..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              ></textarea>
            </div>
          </div>

          {/* Section 2: Photos Upload */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2">
              2. Photos & Media
            </h3>
            <ImageUpload
              files={files}
              setFiles={setFiles}
              mainIndex={mainIndex}
              setMainIndex={setMainIndex}
            />
          </div>

          {/* Section 3: Pricing & Deposit */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Pricing & Security Deposit (₹)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Price Per Day (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={perDay}
                  onChange={(e) => setPerDay(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Price Per Hour (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={perHour}
                  onChange={(e) => setPerHour(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Weekly Rate Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={perWeek}
                  onChange={(e) => setPerWeek(e.target.value)}
                  placeholder="e.g. 2800"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Late Return Fee Per Day (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lateFeePerDay}
                  onChange={(e) => setLateFeePerDay(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Location & Handover */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              4. Location & Pickup Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CITIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Neighborhood / Area
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Koramangala 4th Block"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Approximate Address / Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Near Sony World Signal"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Rules & Conditions */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              5. Rules & Conditions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Item Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CONDITIONS.filter((c) => c !== 'All').map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Handover Mode
                </label>
                <select
                  value={pickupOrDelivery}
                  onChange={(e) => setPickupOrDelivery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="pickup">Borrower Pick Up Only</option>
                  <option value="delivery">Delivery by Lender</option>
                  <option value="both">Both Pickup & Delivery</option>
                </select>
              </div>
            </div>

            {/* Payment Acceptance */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Accepted Payment Methods
              </label>
              <div className="flex items-center gap-6 text-sm font-medium text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptOnline}
                    onChange={(e) => setAcceptOnline(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Online Payment (Escrow Card / UPI)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptOffline}
                    onChange={(e) => setAcceptOffline(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Offline Cash / Handover</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-base shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Publishing Listing to BorrowLoop...</span>
                </>
              ) : (
                <>
                  <span>Publish Listing</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingPage;
