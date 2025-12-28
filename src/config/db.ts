import mongoose from 'mongoose';

const connectDB = async (): Promise<string | undefined> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI!, {
      dbName: process.env.DB_NAME || 'codefotech_db',
      writeConcern: {
        w: 'majority',
        wtimeout: 5000,
        j: true,
      },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn?.connection?.db?.databaseName}`);
    console.log(`🔧 Write Concern: ${JSON.stringify(conn?.connection?.db?.writeConcern)}`);
    return conn.connection.host;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    if (error instanceof Error) {
      console.error(`📝 Error Message: ${error.message}`);
      console.error(`🔍 Error Name: ${error.name}`);
      if (error.stack) {
        console.error(`📚 Stack Trace: ${error.stack}`);
      }
    } else {
      console.error('🚫 Unknown error occurred while connecting to MongoDB');
      console.error('🔍 Error Details:', error);
    }
    console.error(
      '🌐 Connection String (sanitized):',
      process.env.MONGO_DB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    );
    process.exit(1);
  }
};

export default connectDB;
