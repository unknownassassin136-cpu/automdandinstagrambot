"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./database/db");
const redis_1 = require("./config/redis");
const database_1 = require("./config/database");
const usage_reset_cron_1 = require("./cron/usage-reset.cron");
const ngrok_1 = __importDefault(require("@ngrok/ngrok"));
async function bootstrap() {
    // Step 1: Validate environment (crashes immediately if invalid)
    const env = (0, env_1.validateEnv)();
    console.log('✓ Environment validated');
    // Step 2: Connect database (Drizzle + Supabase PostgreSQL)
    await (0, db_1.initDatabase)();
    console.log('✓ Database connected');
    // Step 3: Connect Redis
    const redis = await (0, redis_1.initRedis)();
    console.log('✓ Redis connected');
    // Step 4: Verify Supabase Storage
    await (0, database_1.verifyStorage)();
    console.log('✓ Storage connected');
    // Step 5: Start BullMQ workers
    // startWorkers(redis);
    console.log('✓ Queue workers started (mock)');
    // Step 6: Start cron jobs
    (0, usage_reset_cron_1.initCronJobs)();
    console.log('✓ Cron jobs initialized');
    // Step 7: Start Express
    app_1.app.listen(env.PORT, async () => {
        console.log('──────────────────────────────');
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`📡 Environment: ${env.NODE_ENV}`);
        console.log('──────────────────────────────');
        // Step 8: Initialize ngrok if configured
        if (env.NGROK_AUTHTOKEN && env.NGROK_DOMAIN) {
            try {
                console.log(`[Ngrok] Starting tunnel for ${env.NGROK_DOMAIN}...`);
                const listener = await ngrok_1.default.forward({
                    addr: env.PORT,
                    authtoken: env.NGROK_AUTHTOKEN,
                    domain: env.NGROK_DOMAIN,
                });
                console.log(`✅ [Ngrok] Tunnel established at: ${listener.url()}`);
            }
            catch (err) {
                console.error(`✗ [Ngrok] Failed to start tunnel:`, err.message);
            }
        }
    });
}
bootstrap().catch((err) => {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
});
