import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';
import * as relations from './relations';

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema: { ...schema, ...relations } });

export async function initDatabase() {
  // Simple check to ensure database connection works
  await client`SELECT 1`;

  // Auto-migrate schema changes
  try { await client`ALTER TABLE automation_rules ADD COLUMN reply_comment_variants JSONB;`; } catch(e) {}
  try { await client`ALTER TABLE automation_rules ADD COLUMN dm_template_variants JSONB;`; } catch(e) {}
  
  return db;
}
