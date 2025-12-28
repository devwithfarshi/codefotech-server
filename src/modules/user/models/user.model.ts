import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IUser, UserRoleList } from '../types/user.types';

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: UserRoleList,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        return ret;
      },
    },
  }
);

// Hash password before saving (only for local auth users)
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

UserSchema.plugin(mongoosePaginate);

// Create indexes for better performance
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model<IUser, mongoose.PaginateModel<IUser>>('User', UserSchema);
