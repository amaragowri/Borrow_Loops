const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Bengaluru, India',
    },
    bio: {
      type: String,
      trim: true,
      default: 'BorrowLoop member sharing resources in the community.',
    },
    avatar: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      publicId: {
        type: String,
        default: 'default_avatar',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preference: {
      type: String,
      enum: ['borrower', 'lender', 'both'],
      default: 'both',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
