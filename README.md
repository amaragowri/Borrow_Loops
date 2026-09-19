# BorrowLoop – Smart Borrowing & Lending Marketplace

> “Borrow what you need. Share what you have.”

BorrowLoop is a full-stack, peer-to-peer equipment and service sharing platform built on the MERN stack (MongoDB, Express, React, Node.js) with Vite and Tailwind CSS. It enables individuals to lend high-value items (cameras, electronics, tools, sports gear, musical instruments) to local neighbors while providing real-time availability clash prevention, provider-ready online/offline payments, multi-image upload galleries with dark lightboxes, dual-role dashboards, reviews, favorites, and admin moderation.

---

## 🚀 Key Features

### 1. Peer-to-Peer Marketplace & Discovery
- **Hero & Search System**: Search by keywords, category, city, or date range.
- **Dynamic Explore Page**: Multi-criteria filtering by category, price range slider, location, condition, rating, and sorting (price, newest, rating).
- **Listing Cards**: Responsive cards displaying high-res thumbnail, favorite bookmark button, pricing/day & /hr, rating, condition tag, and location.

### 2. Strict Anti-Double-Booking Availability Engine
- **Server-Side Conflict Engine**: Prevents double-booking by calculating overlap across active, confirmed, and pending bookings.
- **Real-Time Date Verification**: `GET /api/listings/:id/availability` validates selected date/time ranges before checkout.
- **Server Pricing Recalculation**: Durations (hours or days), discounts, 5% platform fee, and refundable security deposit recalculated securely on the server.

### 3. Media & Image Upload Architecture
- **Multi-Image Support**: 1 to 8 high-resolution photos per listing.
- **Interactive Upload Zone**: Drag-and-drop file upload, size checks (<5MB), format checks (JPG, PNG, WEBP), and "Set as Main Thumbnail" capability.
- **Modular Storage Abstraction**: Local static storage in `server/uploads/` with a clean provider interface ready for Cloudinary/AWS S3.
- **Listing Gallery & Lightbox**: Interactive gallery on listing details with thumbnail navigation, next/previous arrow controls, counter, and a fullscreen dark lightbox.

### 4. Booking & Payment System
- **Online Checkout Simulation**: Interactive modal simulating Credit/Debit card, UPI VPA/QR, and Netbanking with transaction identifiers and confetti celebration upon confirmation.
- **Offline Handover Settlement**: Cash or direct UPI settlement upon in-person handover; lender verifies payment in their dashboard.
- **Lifecycle Status Management**: Full transition tracking (`pending` → `confirmed` → `active` → `completed` or `cancelled`).

### 5. Dual-Role Dashboards & Admin Center
- **Borrower Hub**: Current bookings, upcoming reservations, payment receipts, cancel options, and completed rental review forms.
- **Lender Hub**: Published listings management (pause/activate, delete), incoming booking request approval/rejection, and earnings summary.
- **Favorites & Notifications**: Real-time in-app notification dropdown for booking updates, review alerts, and wishlist management.
- **Admin Center**: Platform KPIs (Users, Listings, Volume, Commission), user account suspension/reactivation, and content moderation.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - React Router DOM v7
  - Axios
  - Lucide React
  - Canvas Confetti
  - Google Fonts (Plus Jakarta Sans & Inter)
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JSON Web Tokens (JWT) & bcryptjs
  - Multer for secure multipart image uploads
  - Morgan logging & CORS
- **Database**:
  - Local MongoDB instance (`mongodb://127.0.0.1:27017/borrowloop`)

---

## 📁 Architecture & Directory Structure

```
BorrowLoop/
├── client/                     # Vite + React + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ListingCard, ImageGallery, ImageLightbox,
│   │   │                       # ImageUpload, PriceBreakdown, PaymentModal, RatingStars,
│   │   │                       # NotificationDropdown, SkeletonLoader, EmptyState, ProtectedRoute
│   │   ├── context/            # AuthContext, ThemeContext, NotificationContext
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/              # LandingPage, ExplorePage, ListingDetailPage, AddListingPage,
│   │   │                       # DashboardPage, ProfilePage, AdminDashboardPage,
│   │   │                       # LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── routes/             # AppRoutes (Public, Protected, Admin)
│   │   ├── services/           # api.js (Axios with JWT request/response interceptors)
│   │   ├── utils/              # constants.js, imageUtils.js
│   │   ├── App.jsx
│   │   ├── index.css           # Design tokens, dark mode, custom scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express + MongoDB
│   ├── config/                 # db.js (Mongoose connection)
│   ├── controllers/            # auth, listing, booking, payment, review, favorite, notification, admin
│   ├── middleware/             # auth.js, roles.js, upload.js, errorHandler.js
│   ├── models/                 # User, Listing, Booking, Payment, Review, Favorite, Notification, Report
│   ├── routes/                 # Express API routes
│   ├── seeds/                  # seedData.js (12+ multi-category items with photography)
│   ├── services/               # availabilityService.js, paymentService.js, storageService.js
│   ├── utils/                  # jwtHelper.js
│   ├── uploads/                # Static image store (/listings, /profiles)
│   ├── .env                    # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Populates 12 rich listings, demo users, and bookings
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd client
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

---

## 🔑 Demo User Accounts

The database seed provides instant pre-configured demo accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Lender** | `lender@borrowloop.com` | `password123` | Published camera, drill, tent & bike listings |
| **Borrower** | `borrower@borrowloop.com` | `password123` | Completed booking with active review & favorites |
| **Admin** | `admin@borrowloop.com` | `admin123` | Access to Platform Admin Dashboard |

*Tip: Use the one-click demo login buttons on the `/login` page.*

---

## 🌐 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create new user with profile photo
- `POST /api/auth/login`: Authenticate and receive JWT
- `GET /api/auth/me`: Get current session profile
- `PUT /api/auth/profile`: Update profile info and avatar

### Listings (`/api/listings`)
- `GET /api/listings`: Filter and search listings with pagination
- `GET /api/listings/:id`: Detailed listing specs and booked calendar ranges
- `POST /api/listings`: Publish new listing (accepts up to 8 photos)
- `PUT /api/listings/:id`: Modify listing (Owner or Admin)
- `DELETE /api/listings/:id`: Delete listing
- `GET /api/listings/:id/availability`: Check real-time date clash

### Bookings (`/api/bookings`)
- `POST /api/bookings`: Create booking with server availability & price verification
- `GET /api/bookings/my?role=borrower|lender`: View booking history
- `PUT /api/bookings/:id/status`: Approve, reject, activate, complete booking
- `POST /api/bookings/:id/cancel`: Cancel reservation

### Payments (`/api/payments`)
- `POST /api/payments/create-order`: Initialize payment session
- `POST /api/payments/verify`: Confirm online payment & auto-confirm booking
- `POST /api/payments/offline`: Record offline cash/UPI settlement request
- `PUT /api/payments/:id/verify-offline`: Lender confirms offline payment

### Reviews, Favorites, Notifications & Admin
- `POST /api/reviews`: Submit completed booking review & recalculate average ratings
- `POST /api/favorites/:listingId`: Toggle saved bookmark
- `GET /api/notifications`: Retrieve unread in-app alerts
- `GET /api/admin/stats`: Aggregate platform volume & commission metrics

---

## 🔮 Future Enhancements
- WebSockets for live peer-to-peer in-app messaging.
- Integration with Google Maps API for neighborhood radius search.
- Native integration with Razorpay / Stripe webhooks.
- AI-assisted item condition scanning upon return.
