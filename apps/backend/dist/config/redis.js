"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.initRedis = initRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
});
async function initRedis() {
    return new Promise((resolve, reject) => {
        if (exports.redis.status === 'ready' || exports.redis.status === 'connect') {
            return resolve(exports.redis);
        }
        exports.redis.on('connect', () => resolve(exports.redis));
        exports.redis.on('error', (err) => reject(err));
        // In case connection takes too long
        setTimeout(() => reject(new Error('Redis connection timeout')), 15000);
    });
}
