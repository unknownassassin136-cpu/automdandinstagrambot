import { db } from './src/database/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Adding deleted_at to automation_rules...');
    await db.execute(sql`
      ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
