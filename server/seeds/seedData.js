const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri, {
      dbName: 'borrowloop',
    });
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear previous collections
    await User.deleteMany();
    await Listing.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Favorite.deleteMany();
    await Notification.deleteMany();
    console.log('[Seed] Cleaned existing database collections.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Gowri Shankar',
        email: 'lender@borrowloop.com',
        password: 'password123',
        phone: '+91 98765 43210',
        location: 'Koramangala, Bengaluru',
        bio: 'Tech enthusiast, photographer, and DIY maker. Happy to lend gear to passionate creators.',
        avatar: {
          url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          publicId: 'seed_avatar_1',
        },
        role: 'user',
        preference: 'both',
        rating: 4.9,
        ratingsCount: 18,
      },
      {
        name: 'Ananya Sharma',
        email: 'borrower@borrowloop.com',
        password: 'password123',
        phone: '+91 98450 11223',
        location: 'Indiranagar, Bengaluru',
        bio: 'Product designer & weekend backpacker who prefers borrowing sustainably.',
        avatar: {
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          publicId: 'seed_avatar_2',
        },
        role: 'user',
        preference: 'borrower',
        rating: 4.8,
        ratingsCount: 6,
      },
      {
        name: 'BorrowLoop Admin',
        email: 'admin@borrowloop.com',
        password: 'admin123',
        phone: '+91 80000 00000',
        location: 'Bengaluru Central',
        bio: 'Platform safety, moderation & community coordinator.',
        avatar: {
          url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
          publicId: 'seed_avatar_admin',
        },
        role: 'admin',
        preference: 'both',
        rating: 5.0,
        ratingsCount: 30,
      },
      {
        name: 'Vikram Mehta',
        email: 'vikram@borrowloop.com',
        password: 'password123',
        phone: '+91 91234 56789',
        location: 'HSR Layout, Bengaluru',
        bio: 'Musician and audio engineer. Sharing studio gear with fellow artists.',
        avatar: {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          publicId: 'seed_avatar_3',
        },
        role: 'user',
        preference: 'lender',
        rating: 5.0,
        ratingsCount: 12,
      },
    ]);

    const lender = users[0];
    const borrower = users[1];
    const admin = users[2];
    const musician = users[3];

    console.log('[Seed] Created sample users.');

    // 2. Create Realistic Multi-Image Listings
    const sampleListingsData = [
      {
        owner: lender._id,
        title: 'Sony Alpha A7 IV Full-Frame Camera + 24-70mm GM Lens',
        description:
          'Flagship 33MP full-frame mirrorless camera for 4K60p video and studio photography. Includes Sony 24-70mm f/2.8 G-Master lens, 2x high-capacity batteries, 128GB Pro V90 SD card, charger, and padded carrying case.',
        category: 'Cameras',
        subcategory: 'Mirrorless Cameras',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
            publicId: 'cam_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
            publicId: 'cam_2',
            isMain: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
            publicId: 'cam_3',
            isMain: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=80',
            publicId: 'cam_4',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 150,
          perDay: 850,
          perWeek: 4800,
          securityDeposit: 2500,
          lateFeePerDay: 400,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala 4th Block',
          address: '80 Feet Road, Near Sony World Signal',
          zipCode: '560034',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '08:00',
          endTime: '21:00',
          minDurationHours: 4,
          maxDurationDays: 14,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Keep lens cap on when not in use. Do not expose to extreme moisture or rain.',
          condition: 'Like New',
          additionalRequirements: 'Aadhar/Govt ID verification and signed equipment handover form.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.9,
        reviewsCount: 14,
      },
      {
        owner: lender._id,
        title: 'DJI Mini 4 Pro 4K Drone Fly More Combo',
        description:
          'Ultra-light 249g drone with omnidirectional obstacle sensing, 4K/60fps HDR video, and 3x intelligent flight batteries providing up to 90 mins flight time. Comes with DJI RC 2 controller with bright 5.5-inch FHD screen.',
        category: 'Electronics',
        subcategory: 'Drones & Aerial',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80',
            publicId: 'drone_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
            publicId: 'drone_2',
            isMain: false,
          },
          {
            url: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=1000&q=80',
            publicId: 'drone_3',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 200,
          perDay: 1200,
          perWeek: 6500,
          securityDeposit: 3000,
          lateFeePerDay: 500,
        },
        location: {
          city: 'Bengaluru',
          area: 'Indiranagar',
          address: '100ft Road, 12th Main',
          zipCode: '560038',
        },
        availability: {
          availableDays: ['Friday', 'Saturday', 'Sunday', 'Monday'],
          startTime: '07:00',
          endTime: '19:00',
          minDurationHours: 6,
          maxDurationDays: 7,
        },
        rules: {
          pickupOrDelivery: 'both',
          cancellationPolicy: 'Moderate: 50% refund up to 12 hours prior.',
          usageInstructions: 'Strict adherence to local DGCA drone flying regulations required.',
          condition: 'Brand New',
          additionalRequirements: 'Experienced pilots preferred.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 5.0,
        reviewsCount: 8,
      },
      {
        owner: musician._id,
        title: 'Fender Player Stratocaster Electric Guitar + Boss Katana 50W Amp',
        description:
          'Classic Fender Player Stratocaster in Polar White with maple fretboard, versatile 3-pickup setup, paired with a Boss Katana 50 MkII modeling amplifier with built-in effects. Includes guitar cable, gig bag, tuner, and picks.',
        category: 'Musical Instruments',
        subcategory: 'Electric Guitars',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
            publicId: 'guitar_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80',
            publicId: 'guitar_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 80,
          perDay: 450,
          perWeek: 2400,
          securityDeposit: 1500,
          lateFeePerDay: 200,
        },
        location: {
          city: 'Bengaluru',
          area: 'HSR Layout',
          address: 'Sector 2, 27th Main',
          zipCode: '560102',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '10:00',
          endTime: '22:00',
          minDurationHours: 3,
          maxDurationDays: 20,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Do not alter truss rod or bridge settings without consulting.',
          condition: 'Like New',
          additionalRequirements: 'Please keep inside gig bag during transit.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.8,
        reviewsCount: 9,
      },
      {
        owner: lender._id,
        title: 'DeWalt 20V Max Cordless Hammer Drill & Impact Driver Combo Kit',
        description:
          'Heavy duty professional drill kit with brushless motor, 2x 4.0Ah lithium ion batteries, high speed charger, hard kitbox, and a 32-piece titanium drill bit set. Perfect for DIY home renovation, masonry, wood, and metal.',
        category: 'Tools',
        subcategory: 'Power Tools',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80',
            publicId: 'drill_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80',
            publicId: 'drill_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 50,
          perDay: 300,
          perWeek: 1600,
          securityDeposit: 800,
          lateFeePerDay: 150,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala',
          address: 'Near Forum Mall',
          zipCode: '560095',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '08:00',
          endTime: '20:00',
          minDurationHours: 2,
          maxDurationDays: 7,
        },
        rules: {
          pickupOrDelivery: 'both',
          cancellationPolicy: 'Flexible: Full refund up to 12 hours before pickup.',
          usageInstructions: 'Wear safety goggles provided with the kit.',
          condition: 'Good',
          additionalRequirements: 'Safety waiver acknowledged on delivery.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.9,
        reviewsCount: 15,
      },
      {
        owner: musician._id,
        title: 'Yamaha P-125 88-Key Weighted Action Digital Piano',
        description:
          'Graded Hammer Standard (GHS) weighted keyboard offering authentic acoustic piano touch and Pure CF sound engine. Comes with heavy-duty X-stand, sustain pedal, music rest, power supply, and AKG studio headphones.',
        category: 'Musical Instruments',
        subcategory: 'Keyboards & Pianos',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1520523839898-50712743e9a7?auto=format&fit=crop&w=1000&q=80',
            publicId: 'piano_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1571974599782-87624638275e?auto=format&fit=crop&w=1000&q=80',
            publicId: 'piano_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 100,
          perDay: 600,
          perWeek: 3200,
          securityDeposit: 2000,
          lateFeePerDay: 300,
        },
        location: {
          city: 'Bengaluru',
          area: 'HSR Layout',
          address: 'Sector 4, 14th Main',
          zipCode: '560102',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '09:00',
          endTime: '21:00',
          minDurationHours: 4,
          maxDurationDays: 30,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Keep dry and handle keyboard keys gently.',
          condition: 'Like New',
          additionalRequirements: 'Careful transportation required.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 5.0,
        reviewsCount: 7,
      },
      {
        owner: lender._id,
        title: 'BenQ 4K HDR Home Cinema Projector + 100-inch Portable Screen',
        description:
          'True 4K UHD 3840x2160 resolution, 3000 ANSI Lumens, 96% Rec.709 cinematic color accuracy. Includes easy folding 100-inch wrinkle-free projector screen with stand, HDMI 2.1 cable, and Bluetooth remote. Transform your backyard or hall into an IMAX experience.',
        category: 'Event Equipment',
        subcategory: 'Projectors & Screens',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',
            publicId: 'proj_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
            publicId: 'proj_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 120,
          perDay: 750,
          perWeek: 4000,
          securityDeposit: 2500,
          lateFeePerDay: 350,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala',
          address: '5th Block, Industrial Layout',
          zipCode: '560095',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '09:00',
          endTime: '23:00',
          minDurationHours: 4,
          maxDurationDays: 10,
        },
        rules: {
          pickupOrDelivery: 'both',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Allow fan to cool down completely before powering off projector.',
          condition: 'Like New',
          additionalRequirements: 'Deposit refundable immediately upon test check.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.9,
        reviewsCount: 11,
      },
      {
        owner: lender._id,
        title: 'Trek FX 3 Disc Hybrid Road Bicycle (Medium Frame)',
        description:
          'Versatile performance fitness hybrid bike with lightweight Alpha Gold aluminum frame, carbon fork, 1x10 Shimano Deore drivetrain, and powerful hydraulic disc brakes. Includes helmet, Kryptonite U-lock, water bottle cage, and LED lights.',
        category: 'Vehicles',
        subcategory: 'Bicycles & Scooters',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
            publicId: 'bike_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
            publicId: 'bike_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 40,
          perDay: 250,
          perWeek: 1300,
          securityDeposit: 1000,
          lateFeePerDay: 150,
        },
        location: {
          city: 'Bengaluru',
          area: 'Indiranagar',
          address: 'Defence Colony',
          zipCode: '560038',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '06:00',
          endTime: '20:00',
          minDurationHours: 2,
          maxDurationDays: 14,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Flexible: Full refund up to 12 hours before pickup.',
          usageInstructions: 'Always lock frame and front wheel together with U-lock provided.',
          condition: 'Like New',
          additionalRequirements: 'Helmet must be worn at all times.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.8,
        reviewsCount: 16,
      },
      {
        owner: lender._id,
        title: 'Quechua 4-Person Waterproof Camping Tent + Sleeping Bags & Mats',
        description:
          'Spacious waterproof pop-up dome tent with Fresh&Black technology keeping interior cool and dark. Includes 2x thermal sleeping bags (-5C rated), 2x self-inflating mattress pads, camping lantern, and ground pegs.',
        category: 'Sports',
        subcategory: 'Outdoor & Camping',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80',
            publicId: 'tent_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=1000&q=80',
            publicId: 'tent_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 50,
          perDay: 350,
          perWeek: 1800,
          securityDeposit: 1200,
          lateFeePerDay: 150,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala',
          address: '1st Block, Wipro Park Road',
          zipCode: '560034',
        },
        availability: {
          availableDays: ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'],
          startTime: '08:00',
          endTime: '21:00',
          minDurationHours: 24,
          maxDurationDays: 10,
        },
        rules: {
          pickupOrDelivery: 'both',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Ensure tent fabric is completely dry before folding back into tote bag.',
          condition: 'Like New',
          additionalRequirements: 'No smoking or open cooking flames inside tent.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.9,
        reviewsCount: 13,
      },
      {
        owner: musician._id,
        title: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
        description:
          'Ultimate creative powerhouse for video rendering, Unreal Engine, software development, and AI tasks. Liquid Retina XDR 120Hz display with 140W MagSafe fast charger and protective Tomtoc sleeve.',
        category: 'Electronics',
        subcategory: 'Laptops & Computing',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
            publicId: 'mac_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
            publicId: 'mac_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 250,
          perDay: 1500,
          perWeek: 8500,
          securityDeposit: 5000,
          lateFeePerDay: 600,
        },
        location: {
          city: 'Bengaluru',
          area: 'HSR Layout',
          address: 'Sector 6, Outer Ring Road',
          zipCode: '560102',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '09:00',
          endTime: '20:00',
          minDurationHours: 8,
          maxDurationDays: 14,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Strict: 50% refund up to 48 hours prior.',
          usageInstructions: 'Clean guest account will be provided. No physical modifications allowed.',
          condition: 'Brand New',
          additionalRequirements: 'Valid Company ID or verified LinkedIn profile required.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 5.0,
        reviewsCount: 10,
      },
      {
        owner: lender._id,
        title: 'Herman Miller Aeron Ergonomic Chair (Size B, Fully Loaded)',
        description:
          'World-famous ergonomic chair with posture fit SL support, adjustable tilt limiter, forward tilt, and 3D armrests. Ideal for intense hackathons, remote project sprints, or posture correction.',
        category: 'Furniture',
        subcategory: 'Office Chairs',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1580481077195-c9994c92b8d4?auto=format&fit=crop&w=1000&q=80',
            publicId: 'chair_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80',
            publicId: 'chair_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 40,
          perDay: 220,
          perWeek: 1200,
          securityDeposit: 1500,
          lateFeePerDay: 100,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala',
          address: '3rd Block, Near Post Office',
          zipCode: '560034',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '09:00',
          endTime: '19:00',
          minDurationHours: 24,
          maxDurationDays: 60,
        },
        rules: {
          pickupOrDelivery: 'delivery',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before delivery.',
          usageInstructions: 'Use on smooth surface or floor mat.',
          condition: 'Like New',
          additionalRequirements: 'Delivery fee arranged based on distance.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.7,
        reviewsCount: 5,
      },
      {
        owner: musician._id,
        title: 'Bose S1 Pro+ All-in-One Portable Wireless PA Speaker System',
        description:
          'Professional Bluetooth battery-powered multi-position PA system. Features 3-channel mixer, ToneMatch processing, built-in wireless RF receivers for guitars & mics, and up to 11 hours battery life. Includes Shure SM58 vocal microphone.',
        category: 'Event Equipment',
        subcategory: 'Audio & Sound',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
            publicId: 'bose_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80',
            publicId: 'bose_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 90,
          perDay: 550,
          perWeek: 2800,
          securityDeposit: 2000,
          lateFeePerDay: 250,
        },
        location: {
          city: 'Bengaluru',
          area: 'HSR Layout',
          address: 'Sector 1, Club Road',
          zipCode: '560102',
        },
        availability: {
          availableDays: ['Friday', 'Saturday', 'Sunday', 'Monday'],
          startTime: '08:00',
          endTime: '22:00',
          minDurationHours: 4,
          maxDurationDays: 5,
        },
        rules: {
          pickupOrDelivery: 'both',
          cancellationPolicy: 'Flexible: Full refund up to 24 hours before pickup.',
          usageInstructions: 'Do not overdrive volume into clipping zone.',
          condition: 'Like New',
          additionalRequirements: 'Signed agreement on return condition.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 5.0,
        reviewsCount: 14,
      },
      {
        owner: lender._id,
        title: 'Collector Edition Vintage Sci-Fi & Design Classics Book Bundle',
        description:
          'Curated hardcover set featuring Dune Deluxe, Neuromancer 30th Anniversary, The Design of Everyday Things, and Dieter Rams: As Little Design as Possible. Exceptional condition for reading retreats or study.',
        category: 'Books',
        subcategory: 'Design & Sci-Fi Hardcovers',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
            publicId: 'book_1',
            isMain: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
            publicId: 'book_2',
            isMain: false,
          },
        ],
        pricing: {
          perHour: 15,
          perDay: 80,
          perWeek: 400,
          securityDeposit: 500,
          lateFeePerDay: 50,
        },
        location: {
          city: 'Bengaluru',
          area: 'Koramangala',
          address: '6th Block, 1st Cross',
          zipCode: '560095',
        },
        availability: {
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: '10:00',
          endTime: '20:00',
          minDurationHours: 24,
          maxDurationDays: 30,
        },
        rules: {
          pickupOrDelivery: 'pickup',
          cancellationPolicy: 'Flexible: Full refund anytime before pickup.',
          usageInstructions: 'Please do not dog-ear pages or write in margins.',
          condition: 'Like New',
          additionalRequirements: 'Bookmark included.',
        },
        paymentMethods: ['online', 'offline'],
        rating: 4.9,
        reviewsCount: 8,
      },
    ];

    const createdListings = await Listing.create(sampleListingsData);
    console.log(`[Seed] Created ${createdListings.length} rich listings with image galleries.`);

    // 3. Create Sample Completed & Active Bookings
    const pastStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

    const completedBooking = await Booking.create({
      borrower: borrower._id,
      lender: lender._id,
      listing: createdListings[0]._id, // Sony camera
      startDate: pastStart,
      endDate: pastEnd,
      startTime: '10:00',
      endTime: '18:00',
      duration: 3,
      durationUnit: 'days',
      pricing: {
        basePrice: 2550,
        securityDeposit: 2500,
        serviceFee: 128,
        totalAmount: 5178,
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      bookingStatus: 'completed',
      reviewSubmitted: true,
    });

    await Payment.create({
      booking: completedBooking._id,
      payer: borrower._id,
      payee: lender._id,
      listing: createdListings[0]._id,
      amount: 5178,
      currency: 'INR',
      method: 'online',
      provider: 'mock_gateway',
      transactionId: 'txn_seed_past_001',
      status: 'paid',
      details: {
        cardBrand: 'Visa',
        cardLast4: '4242',
        paymentChannel: 'Card Online',
      },
    });

    // Create review for completed booking
    await Review.create({
      booking: completedBooking._id,
      listing: createdListings[0]._id,
      reviewer: borrower._id,
      reviewee: lender._id,
      rating: 5,
      comment:
        'Exceptional gear! The camera and GM lens were in mint condition. Gowri was extremely responsive, explained all settings, and made the pickup seamless. Will definitely rent again!',
    });

    // Create upcoming active booking for another item
    const futureStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const futureEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const upcomingBooking = await Booking.create({
      borrower: borrower._id,
      lender: lender._id,
      listing: createdListings[1]._id, // Drone
      startDate: futureStart,
      endDate: futureEnd,
      startTime: '09:00',
      endTime: '18:00',
      duration: 2,
      durationUnit: 'days',
      pricing: {
        basePrice: 2400,
        securityDeposit: 3000,
        serviceFee: 120,
        totalAmount: 5520,
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    });

    // Create favorite for borrower
    await Favorite.create({
      user: borrower._id,
      listing: createdListings[0]._id,
    });
    await Favorite.create({
      user: borrower._id,
      listing: createdListings[2]._id,
    });

    // Create Notifications
    await Notification.create([
      {
        recipient: lender._id,
        sender: borrower._id,
        title: 'New Review Received! ⭐',
        message: 'Ananya Sharma gave your Sony Alpha camera a 5-star rating!',
        type: 'review_received',
        link: `/listing/${createdListings[0]._id}`,
        isRead: false,
      },
      {
        recipient: borrower._id,
        sender: lender._id,
        title: 'Booking Confirmed! 🎉',
        message: 'Your rental for the DJI Mini 4 Pro Drone has been confirmed.',
        type: 'booking_confirmed',
        link: '/dashboard?tab=borrower',
        isRead: false,
      },
    ]);

    console.log('[Seed] Database seeding completed successfully! ✨');
    console.log('Sample Accounts Created:');
    console.log('  Lender:   lender@borrowloop.com   / password123');
    console.log('  Borrower: borrower@borrowloop.com / password123');
    console.log('  Admin:    admin@borrowloop.com    / admin123');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
