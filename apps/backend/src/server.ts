import { app } from './app';
import { validateEnv } from './config/env';
import { initDatabase } from './database/db';
import { initRedis } from './config/redis';
import { verifyStorage } from './config/database';
import { initCronJobs } from './cron/usage-reset.cron';
import ngrok from '@ngrok/ngrok';

async function bootstrap() {
  // Step 1: Validate environment (crashes immediately if invalid)
  const env = validateEnv();
  console.log('✓ Environment validated');

  // Step 2: Connect database (Drizzle + Supabase PostgreSQL)
  await initDatabase();
  console.log('✓ Database connected');

  // Step 3: Connect Redis
  const redis = await initRedis();
  console.log('✓ Redis connected');

  // Step 4: Verify Supabase Storage
  await verifyStorage();
  console.log('✓ Storage connected');

  // Step 5: Start BullMQ workers
  // startWorkers(redis);
  console.log('✓ Queue workers started (mock)');

  // Step 6: Start cron jobs
  initCronJobs();
  console.log('✓ Cron jobs initialized');

  // Step 7: Start Express
  app.listen(env.PORT, async () => {
    console.log('──────────────────────────────');
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log('──────────────────────────────');

    // Step 8: Initialize ngrok if configured
    if (env.NGROK_AUTHTOKEN && env.NGROK_DOMAIN) {
      try {
        console.log(`[Ngrok] Starting tunnel for ${env.NGROK_DOMAIN}...`);
        const listener = await ngrok.forward({
          addr: env.PORT,
          authtoken: env.NGROK_AUTHTOKEN,
          domain: env.NGROK_DOMAIN,
        });
        console.log(`✅ [Ngrok] Tunnel established at: ${listener.url()}`);
      } catch (err: any) {
        console.error(`✗ [Ngrok] Failed to start tunnel:`, err.message);
      }
    }
  });
}

bootstrap().catch((err) => {
  console.error('✗ Failed to start server:', err.message);
  process.exit(1);
});
