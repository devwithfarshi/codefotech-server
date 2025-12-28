import Redis from 'ioredis';

let redisClient: Redis;

const connectRedis = async (): Promise<Redis> => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

    redisClient.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Disconnected');
    });

    // We don't log here as we'll log in server.ts

    return redisClient;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Redis Connection Error: ${error.message}`);
    } else {
      console.error('Unknown error occurred while connecting to Redis');
    }
    process.exit(1);
  }
};

const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis Disconnected');
  }
};

export { connectRedis, getRedisClient, disconnectRedis };
export default connectRedis;
