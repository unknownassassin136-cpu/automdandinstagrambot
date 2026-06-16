import cron from 'node-cron';
import { db } from '../database/db';
import { usageTracking } from '../database/schema';

// Run at midnight on the first day of every month
export const initCronJobs = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly usage reset cron job...');
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // We don't actually delete old usage, we just rely on the new month string to start fresh.
    // However, if we wanted to eagerly initialize, we could fetch all active users and insert
    // zero counts for them. In our case, the service layer handles creation lazily.
    console.log(`Usage tracking initialized for new month: ${currentMonth}`);
  });

  console.log('Cron jobs initialized');
};
