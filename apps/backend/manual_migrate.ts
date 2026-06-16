import { db } from './src/database/db';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running manual migration...');
  try {
    // Add columns
    await db.execute(sql`ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS target_media_id VARCHAR(255);`);
    await db.execute(sql`ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS is_default_rule BOOLEAN DEFAULT false;`);
    await db.execute(sql`ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50) DEFAULT 'exact';`);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

migrate();
