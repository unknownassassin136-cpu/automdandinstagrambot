import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Database (Supabase PostgreSQL — used by Drizzle)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Meta
  META_APP_ID: z.string().min(1, 'META_APP_ID is required'),
  META_APP_SECRET: z.string().min(1, 'META_APP_SECRET is required'),
  META_VERIFY_TOKEN: z.string().min(1, 'META_VERIFY_TOKEN is required'),

  // Encryption
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 bytes'),

  // Ngrok
  NGROK_AUTHTOKEN: z.string().optional(),
  NGROK_DOMAIN: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').default('noreply@yourdomain.com'),

  // URLs
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  // If we are running drizzle-kit or just importing this in a build step,
  // we might want to bypass strict validation or provide dummy values.
  // But per spec, it must fail fast.
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('✗ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  ✗ ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1); // FAIL FAST — never start with bad config
  }
  return result.data;
}

// Load .env explicitly if needed, but typically handled by dotenv/ts-node
import * as dotenv from 'dotenv';
dotenv.config();

export const env = validateEnv();
