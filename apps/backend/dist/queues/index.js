"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaSyncQueue = exports.dmQueue = exports.replyQueue = exports.webhookQueue = void 0;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.webhookQueue = new bullmq_1.Queue('webhook-events', { connection: connection_1.redisConnection });
exports.replyQueue = new bullmq_1.Queue('reply-actions', { connection: connection_1.redisConnection });
exports.dmQueue = new bullmq_1.Queue('dm-actions', { connection: connection_1.redisConnection });
exports.mediaSyncQueue = new bullmq_1.Queue('media-sync', { connection: connection_1.redisConnection });
async function closeQueues() {
    await exports.webhookQueue.close();
    await exports.replyQueue.close();
    await exports.dmQueue.close();
    await exports.mediaSyncQueue.close();
}
