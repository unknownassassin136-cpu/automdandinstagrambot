import { db } from './src/database/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE connected_accounts ALTER COLUMN facebook_page_id DROP NOT NULL`);
    console.log('Successfully dropped NOT NULL from facebook_page_id');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
