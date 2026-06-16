"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookWorker = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("../queues/connection");
const webhooks_repository_1 = require("../modules/webhooks/webhooks.repository");
const webhooksRepo = new webhooks_repository_1.WebhooksRepository();
exports.webhookWorker = new bullmq_1.Worker('webhook-events', async (job) => {
    console.log(`Processing webhook event ${job.data.eventId}`);
    // Here we would match against RulesService to find the keyword
    // For MVP, we will just log it and mark processed
    await webhooksRepo.updateEventStatus(job.data.eventId, 'processed');
}, { connection: connection_1.redisConnection });
exports.webhookWorker.on('failed', async (job, err) => {
    if (job) {
        console.error(`Job ${job.id} failed:`, err);
        await webhooksRepo.updateEventStatus(job.data.eventId, 'failed', err.message);
    }
});
