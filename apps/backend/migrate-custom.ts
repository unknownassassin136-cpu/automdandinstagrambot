import { db } from './src/database/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    await db.execute(sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS has_ai_addon boolean DEFAULT false;`);
    console.log('Migration successful');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
