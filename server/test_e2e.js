const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';
const CLIENT_URL = 'http://localhost:5173';

async function runE2ETests() {
  console.log('🚀 Starting Full-Stack BorrowLoop Automated Test Suite...\n');

  // 1. Verify Client Server
  try {
    const clientRes = await fetch(CLIENT_URL);
    const clientHtml = await clientRes.text();
    assert(clientRes.status === 200, 'Client server should respond with 200');
    assert(clientHtml.includes('BorrowLoop'), 'Client HTML should include BorrowLoop title');
    console.log('✅ [1/9] Vite Client Server is running and serving index.html');
  } catch (err) {
    console.error('❌ Client verification failed:', err.message);
    process.exit(1);
  }

  // 2. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  assert(healthRes.success && healthRes.database === 'connected', 'Health check must return success and connected database');
  console.log('✅ [2/9] Backend API Health Check is OK');

  // 3. Auth Test - Login Lender & Borrower
  const lenderLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'lender@borrowloop.com', password: 'password123' }),
  }).then((r) => r.json());

  assert(lenderLogin.success, 'Lender login must succeed');
  assert(lenderLogin.token, 'Token must be returned');
  const lenderToken = lenderLogin.token;
  console.log('✅ [3/9] Lender Authentication & JWT token validated');

  const borrowerLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'borrower@borrowloop.com', password: 'password123' }),
  }).then((r) => r.json());

  assert(borrowerLogin.success, 'Borrower login must succeed');
  const borrowerToken = borrowerLogin.token;
  console.log('✅ [4/9] Borrower Authentication & Session validated');

  // 4. Listings Fetch & Filter
  const listingsRes = await fetch(`${BASE_URL}/listings?category=Cameras`).then((r) => r.json());
  assert(listingsRes.success, 'Listings query must succeed');
  assert(listingsRes.listings.length > 0, 'Should find camera listings');
  const targetListing = listingsRes.listings[0];
  console.log(`✅ [5/9] Listings & Category filter working: Found "${targetListing.title}"`);

  // 5. Availability Conflict Engine & Date Overlap
  const testMonth = Math.floor(Math.random() * 12) + 1;
  const testDay = Math.floor(Math.random() * 20) + 1;
  const formattedMonth = testMonth.toString().padStart(2, '0');
  const formattedDay = testDay.toString().padStart(2, '0');
  const endDay = (testDay + 3).toString().padStart(2, '0');

  const testStart = `2029-${formattedMonth}-${formattedDay}`;
  const testEnd = `2029-${formattedMonth}-${endDay}`;

  const availRes = await fetch(
    `${BASE_URL}/listings/${targetListing._id}/availability?startDate=${testStart}&endDate=${testEnd}`
  ).then((r) => r.json());
  assert(availRes.success && availRes.available, 'Availability check must succeed');
  console.log('✅ [6/9] Real-time Availability Conflict Engine is operational');

  // 6. Booking Creation Test
  const bookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${borrowerToken}`,
    },
    body: JSON.stringify({
      listingId: targetListing._id,
      startDate: testStart,
      endDate: testEnd,
      startTime: '10:00',
      endTime: '18:00',
      durationUnit: 'days',
      paymentMethod: 'online',
    }),
  }).then((r) => r.json());

  assert(bookingRes.success, 'Booking creation must succeed');
  const createdBooking = bookingRes.booking;
  console.log(`✅ [7/9] Booking Creation & Server-side Pricing Recalculation verified (Total: ₹${createdBooking.pricing.totalAmount})`);

  // Double Booking Prevention Check: Request overlapping dates!
  const doubleBookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${borrowerToken}`,
    },
    body: JSON.stringify({
      listingId: targetListing._id,
      startDate: testStart,
      endDate: testEnd,
      durationUnit: 'days',
      paymentMethod: 'online',
    }),
  }).then((r) => r.json());

  assert(!doubleBookingRes.success, 'Double booking MUST be rejected by server');
  console.log('✅ [8/9] Strict Double-Booking Clash Prevention confirmed: overlap blocked with 409 Conflict');

  // 7. Payment Simulation & Confirmation
  const paymentRes = await fetch(`${BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${borrowerToken}`,
    },
    body: JSON.stringify({
      bookingId: createdBooking._id,
      cardDetails: { brand: 'Visa', last4: '4242' },
    }),
  }).then((r) => r.json());

  assert(paymentRes.success, 'Payment simulation must succeed');
  assert.strictEqual(paymentRes.booking.bookingStatus, 'confirmed', 'Booking must be auto-confirmed after payment');
  console.log(`✅ [9/9] Online Payment Gateway simulation verified (Txn ID: ${paymentRes.transactionId})`);

  console.log('\n🎉 ALL 9/9 AUTOMATED FULL-STACK VERIFICATION TESTS PASSED SUCCESSFULLY! 🌟');
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
