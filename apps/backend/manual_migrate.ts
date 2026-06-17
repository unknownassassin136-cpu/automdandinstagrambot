import { db } from './src/database/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Creating subscriptions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_name VARCHAR(50) NOT NULL DEFAULT 'free',
        status VARCHAR(20) DEFAULT 'active',
        monthly_limit INTEGER DEFAULT 100,
        max_accounts INTEGER DEFAULT 1,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Creating usage_tracking table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        month VARCHAR(7) NOT NULL,
        reply_count INTEGER DEFAULT 0,
        dm_count INTEGER DEFAULT 0
      );
    `);

    console.log('Adding unique constraint to usage_tracking...');
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unq_user_month ON usage_tracking (user_id, month);
    `);

    console.log('Successfully created tables');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
