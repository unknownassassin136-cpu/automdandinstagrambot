import Redis from 'ioredis';
import { env } from './env';

export const redis: any = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

export async function initRedis(): Promise<Redis> {
  return new Promise((resolve, reject) => {
    if (redis.status === 'ready' || redis.status === 'connect') {
      return resolve(redis);
    }
    redis.on('connect', () => resolve(redis));
    redis.on('error', (err: any) => reject(err));
    
    // In case connection takes too long
    setTimeout(() => reject(new Error('Redis connection timeout')), 15000);
  });
}
