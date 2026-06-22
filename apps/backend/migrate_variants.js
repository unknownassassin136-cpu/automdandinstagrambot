const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/automd');

async function run() {
  try {
    console.log('Running migration: Add Variants Columns');
    
    // Add reply_comment_variants
    try {
      await sql`ALTER TABLE automation_rules ADD COLUMN reply_comment_variants JSONB;`;
      console.log('Added reply_comment_variants column.');
    } catch (err) {
      if (err.code === '42701') console.log('reply_comment_variants already exists.');
      else throw err;
    }

    // Add dm_template_variants
    try {
      await sql`ALTER TABLE automation_rules ADD COLUMN dm_template_variants JSONB;`;
      console.log('Added dm_template_variants column.');
    } catch (err) {
      if (err.code === '42701') console.log('dm_template_variants already exists.');
      else throw err;
    }

    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
