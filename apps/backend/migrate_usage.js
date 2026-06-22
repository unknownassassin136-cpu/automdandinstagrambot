const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/automd');

async function run() {
  try {
    console.log('Running migration...');
    // Drop old index
    await sql`DROP INDEX IF EXISTS unq_user_month;`;
    
    // Add rule_id column
    await sql`ALTER TABLE usage_tracking ADD COLUMN rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE;`;
    
    // Drop user_id column
    await sql`ALTER TABLE usage_tracking DROP COLUMN user_id;`;
    
    // Add new index
    await sql`CREATE UNIQUE INDEX unq_rule_month ON usage_tracking (rule_id, month);`;
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

run();
