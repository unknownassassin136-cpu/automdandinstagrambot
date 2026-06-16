import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// For drizzle-kit we need to explicitly load .env since it runs outside our normal app lifecycle
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // assuming root .env

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Note: drizzle-kit requires raw env var here if not imported from env.ts
    // or we can import env.ts if it doesn't strictly fail without all other vars.
    // To be safe with fail-fast, we just read process.env.DATABASE_URL
    url: process.env.DATABASE_URL as string,
  },
});
