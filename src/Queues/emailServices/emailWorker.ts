import { Job, JobProgress, Worker } from 'bullmq';
import 'dotenv/config';
import transporter from '../../config/email';
import { getRedisClient } from '../../config/redis';

// Create a function to initialize the email worker
let worker: Worker | null = null;

const initializeEmailWorker = (): Worker => {
  if (!worker) {
    // Create email worker with Redis connection
    worker = new Worker(
      'email-queue',
      async (job: any) => {
        console.log(`Processing email job ${job.id} to: ${job.data.mailOptions.to}`);

        try {
          // Update progress to prevent stalling
          await job.updateProgress(10);

          const { mailOptions } = job.data;

          // Add timeout to email sending operation
          const emailPromise = transporter.sendMail(mailOptions);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Email send timeout after 90 seconds')), 90000)
          );

          // Update progress before sending
          await job.updateProgress(25);

          // Race between email sending and timeout
          const result = (await Promise.race([emailPromise, timeoutPromise])) as any;

          // Update progress after successful send
          await job.updateProgress(100);

          console.log(
            `Email sent successfully to ${mailOptions.to}, messageId: ${result.messageId}`
          );
          return result;
        } catch (error) {
          console.error(`Failed to send email to ${job.data.mailOptions.to}:`, error);
          throw error; // Re-throw to mark job as failed
        }
      },
      {
        connection: getRedisClient(),
        concurrency: parseInt(process.env.EMAIL_CONCURRENCY || '5'),

        // Stall prevention configuration
        stalledInterval: 60 * 1000, // Check for stalled jobs every 60 seconds (default: 30s)
        maxStalledCount: 2, // Allow job to stall twice before permanent failure (default: 1)

        // Optional: Limit number of jobs processed
        limiter: {
          max: 10, // Max 10 jobs
          duration: 60000, // Per 60 seconds (rate limiting)
        },
      }
    );

    // Set up event handlers for worker
    if (worker) {
      worker.on('completed', (job: any) => {
        console.log(`✅ Email job ${job.id} completed successfully`);
      });

      worker.on('failed', async (job: any, err: any) => {
        console.error(`💥 Error: ${err?.message}`);
        console.error(err); // Full error with stack trace
        console.log(`Email send failed for ${job?.id} - ${job?.data?.mailOptions?.to}`);

        // Log specific stall errors
        if (err.message.includes('stalled more than allowable limit')) {
          console.log(
            `⚠️  Job ${job.id} failed due to stalling - consider optimizing email sending`
          );
        }
      });

      worker.on('stalled', (jobId: string) => {
        console.log(`⚠️  Job ${jobId} has stalled - taking longer than expected`);
      });

      worker.on('progress', (job: Job<any, any, string>, progress: JobProgress) => {
        console.log(`📊 Job ${job.id} progress: ${progress}%`);
      });

      worker.on('error', (err: any) => {
        console.error('Worker error:', err);
      });

      // Graceful shutdown
      const gracefulShutdown = async (signal: string) => {
        console.log(`${signal} received. Worker shutting down gracefully...`);
        if (worker) {
          await worker.close();
          console.log('Worker closed successfully');
          process.exit(0);
        }
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
  }
  return worker;
};

export default initializeEmailWorker;
