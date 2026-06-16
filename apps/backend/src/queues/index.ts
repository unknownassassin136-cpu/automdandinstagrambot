import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const webhookQueue = new Queue('webhook-events', { connection: redisConnection });
export const replyQueue = new Queue('reply-actions', { connection: redisConnection });
export const dmQueue = new Queue('dm-actions', { connection: redisConnection });
export const mediaSyncQueue = new Queue('media-sync', { connection: redisConnection });

export async function closeQueues() {
  await webhookQueue.close();
  await replyQueue.close();
  await dmQueue.close();
  await mediaSyncQueue.close();
}
