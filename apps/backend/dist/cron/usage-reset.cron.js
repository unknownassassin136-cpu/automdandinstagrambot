"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
// Run at midnight on the first day of every month
const initCronJobs = () => {
    node_cron_1.default.schedule('0 0 1 * *', async () => {
        console.log('Running monthly usage reset cron job...');
        const currentMonth = new Date().toISOString().slice(0, 7);
        // We don't actually delete old usage, we just rely on the new month string to start fresh.
        // However, if we wanted to eagerly initialize, we could fetch all active users and insert
        // zero counts for them. In our case, the service layer handles creation lazily.
        console.log(`Usage tracking initialized for new month: ${currentMonth}`);
    });
    console.log('Cron jobs initialized');
};
exports.initCronJobs = initCronJobs;
