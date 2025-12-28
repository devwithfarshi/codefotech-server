import http from 'http';
import app from './app';
import connectDB from './config/db';
import { connectRedis } from './config/redis';

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to the database
    const dbHost = await connectDB();
    console.log(`\n✅ MongoDB Connected: ${dbHost}`);

    if (process.env.REDIS_URL) {
      await connectRedis();
      console.log('✅ Redis connected successfully');

      // Initialize email worker to start processing
      const { default: initializeEmailWorker } = await import('./Queues/emailServices/emailWorker');
      initializeEmailWorker();
      console.log('✅ Email worker initialized');
    } else {
      console.log('⚠️ Redis not configured, email queue disabled');
    }

    // Start the server
    const PORT = process.env.PORT || 3000;
    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

// Start the application
initializeServices();
