import { db } from './src/database/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'automation_rules'`);
    console.log(res);
  } catch (err: any) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}
main();
