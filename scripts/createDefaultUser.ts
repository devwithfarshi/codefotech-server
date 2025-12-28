/// <reference types="node" />
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/config/db';
import User from '../src/modules/user/models/user.model';
import { UserRole } from '../src/modules/user/types/user.types';

const createDefaultUser = async () => {
  try {
    // Get user info from environment variables
    const defaultUserName = process.env.DEFAULT_USER_NAME;
    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL;
    const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD;
    const defaultUserRole = (process.env.DEFAULT_USER_ROLE as UserRole) || UserRole.ADMIN;

    // Validate required environment variables
    if (!defaultUserEmail || !defaultUserPassword) {
      console.error('❌ Missing required environment variables:');
      console.error('   - DEFAULT_USER_EMAIL');
      console.error('   - DEFAULT_USER_PASSWORD');
      console.error('   - DEFAULT_USER_NAME (optional)');
      console.error('   - DEFAULT_USER_ROLE (optional, defaults to "admin")');
      process.exit(1);
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: defaultUserEmail });

    if (existingUser) {
      console.log('⚠️  User with this email already exists:');
      console.log(`   📧 Email: ${existingUser.email}`);
      console.log(`   👤 Name: ${existingUser.name}`);
      console.log(`   🔑 Role: ${existingUser.role}`);
      console.log(`   ✅ Active: ${existingUser.isActive}`);
    } else {
      // Create new user
      const newUser = await User.create({
        name: defaultUserName || 'Admin User',
        email: defaultUserEmail,
        password: defaultUserPassword,
        role: defaultUserRole,
        isActive: true,
      });

      console.log('✅ Default user created successfully:');
      console.log(`   📧 Email: ${newUser.email}`);
      console.log(`   👤 Name: ${newUser.name}`);
      console.log(`   🔑 Role: ${newUser.role}`);
      console.log(`   ✅ Active: ${newUser.isActive}`);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default user:');
    if (error instanceof Error) {
      console.error(`   📝 ${error.message}`);
    } else {
      console.error(error);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createDefaultUser();
