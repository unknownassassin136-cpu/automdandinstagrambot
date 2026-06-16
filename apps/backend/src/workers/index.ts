import { Worker } from 'bullmq';
import { redisConnection } from '../queues/connection';
import { WebhooksRepository } from '../modules/webhooks/webhooks.repository';

const webhooksRepo = new WebhooksRepository();

export const webhookWorker = new Worker('webhook-events', async job => {
  console.log(`Processing webhook event ${job.data.eventId}`);
  
  // Here we would match against RulesService to find the keyword
  // For MVP, we will just log it and mark processed
  
  await webhooksRepo.updateEventStatus(job.data.eventId, 'processed');
}, { connection: redisConnection });

webhookWorker.on('failed', async (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed:`, err);
    await webhooksRepo.updateEventStatus(job.data.eventId, 'failed', err.message);
  }
});
