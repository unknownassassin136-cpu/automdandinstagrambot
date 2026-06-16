"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
// Redis connection for BullMQ
exports.redisConnection = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ requires this to be null
});
exports.redisConnection.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});
exports.redisConnection.on('connect', () => {
    console.log('Successfully connected to Redis');
});
