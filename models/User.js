import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
      required: true,
    },
    address: {
      address: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password and sync roles
userSchema.pre('save', async function () {
  // Sync isAdmin and role
  if ((this.role === 'admin' || this.role === 'superadmin') && !this.isAdmin) {
    this.isAdmin = true;
  } else if (this.role === 'user' && this.isAdmin) {
    this.isAdmin = false;
  } else if (this.isAdmin && this.role === 'user') {
    this.role = 'admin'; // Default to admin if isAdmin is true but role is user
  }

  // Count restriction check
  if (this.isModified('role') || this.isNew) {
    if (this.role === 'superadmin') {
      const superAdminCount = await mongoose.models.User.countDocuments({ role: 'superadmin' });
      if (superAdminCount >= 1 && this.isNew) {
        throw new Error('Limit reached: Only 1 Super Admin is allowed.');
      }
      // If updating, check if it's already someone else
      if (!this.isNew) {
        const existingSuperAdmin = await mongoose.models.User.findOne({ role: 'superadmin' });
        if (existingSuperAdmin && existingSuperAdmin._id.toString() !== this._id.toString()) {
          throw new Error('Limit reached: Only 1 Super Admin is allowed.');
        }
      }
    }

    if (this.role === 'admin') {
      const adminCount = await mongoose.models.User.countDocuments({ role: 'admin' });
      if (adminCount >= 2 && (this.isNew || this.isModified('role'))) {
        // Need to check if the current user is already an admin
        const isAlreadyAdmin = await mongoose.models.User.findOne({ _id: this._id, role: 'admin' });
        if (!isAlreadyAdmin) {
          throw new Error('Limit reached: Only 2 Admins are allowed.');
        }
      }
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
