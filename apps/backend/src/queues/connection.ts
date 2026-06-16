import Redis from 'ioredis';
import { env } from '../config/env';

// Redis connection for BullMQ
export const redisConnection: any = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // BullMQ requires this to be null
});

redisConnection.on('error', (err: any) => {
  console.error('Redis Connection Error:', err);
});

redisConnection.on('connect', () => {
  console.log('Successfully connected to Redis');
});
