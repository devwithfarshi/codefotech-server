import { Queue } from 'bullmq';
import 'dotenv/config';
import { getRedisClient } from '../../config/redis';

// Create a function to get or create the email queue
let emailQueue: Queue | null = null;

const getEmailQueue = (): Queue => {
  if (!emailQueue) {
    // Create email queue with Redis connection
    emailQueue = new Queue('email-queue', {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100, // Keep last 100 failed jobs
      },
    });
  }
  return emailQueue;
};

export default getEmailQueue;
