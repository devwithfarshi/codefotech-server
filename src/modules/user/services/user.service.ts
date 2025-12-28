import { PaginateOptions, Types } from 'mongoose';
import User from '../models/user.model';
import {
  CreateUserType,
  IUser,
  LoginUserType,
  ResetPasswordType,
  UpdateUserType,
  UserRole,
} from '../types/user.types';

// Main user service object
const userService = {
  // Create a new user
  async createUser(userData: CreateUserType): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  },

  // Find user by MongoDB ObjectId
  async getUserById(userId: Types.ObjectId): Promise<IUser | null> {
    return await User.findById(userId);
  },

  // Find user by email (includes password for authentication)
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select('+password');
  },

  // Find user by phone number
  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone });
  },

  // Update user fields by id
  async updateUser(userId: Types.ObjectId, updateData: UpdateUserType): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  // Soft delete a user (uses mongoose-delete plugin)
  async deleteUser(userId: string): Promise<boolean> {
    const result = await User.deleteOne({ _id: userId });
    return result.deletedCount > 0;
  },
  // Paginated list of all users (with optional query and projection)
  async getAllUsers(query: object = {}, options: PaginateOptions = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      select = '-password -passwordResetToken',
    } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
      select,
    };

    return await User.paginate({}, paginateOptions);
  },

  // Paginated list of users filtered by role
  async getUsersByRole(role: UserRole, options: PaginateOptions = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      select = '-password -passwordResetToken',
    } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
      select,
    };

    return await User.paginate({ role }, paginateOptions);
  },

  // Search users by name, email, or phone (case-insensitive)
  async searchUsers(searchTerm: string, options: PaginateOptions = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      select = '-password -passwordResetToken',
    } = options;

    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const paginateOptions = {
      page,
      limit,
      sort,
      select,
    };

    return await User.paginate(searchQuery, paginateOptions);
  },

  // Set password reset token and expiry
  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      },
      { new: true }
    );
  },

  // Update user's password and clear reset tokens
  async updatePassword(userId: string, password: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    return await user.save();
  },

  // Reset password with token (only for local users)
  async resetPasswordWithToken(resetData: ResetPasswordType): Promise<IUser | null> {
    const { token, password } = resetData;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) return null;

    return await this.updatePassword(user._id.toString(), password);
  },
  // Toggle user status (active/inactive)
  async toggleUserStatus(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    return await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: !user.isActive } },
      { new: true }
    );
  },

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  },

  // Check if phone exists
  async checkPhoneExists(phone: string): Promise<boolean> {
    const user = await User.findOne({ phone });
    return !!user;
  },

  // Login user with email and password (only for local users)
  async loginUser(loginData: LoginUserType): Promise<IUser | null> {
    const { email, password } = loginData;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return null;

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return null;

    return user;
  },
};

export default userService;
