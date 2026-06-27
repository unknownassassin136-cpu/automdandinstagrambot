require('dotenv').config();
const { db } = require('./dist/database/db');
const { usageTracking, automationRules, connectedAccounts } = require('./dist/database/schema');
const { eq, and, sql } = require('drizzle-orm');

async function run() {
  try {
    const userId = '00000000-0000-0000-0000-000000000000'; // dummy
    const currentMonth = '2026-06';
    
    console.log('Querying...');
    const query = db.select({
      totalReplies: sql`sum(${usageTracking.replyCount})`,
      totalDms: sql`sum(${usageTracking.dmCount})`
    })
    .from(usageTracking)
    .innerJoin(automationRules, eq(usageTracking.ruleId, automationRules.id))
    .innerJoin(connectedAccounts, eq(automationRules.accountId, connectedAccounts.id))
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(usageTracking.month, currentMonth)
      )
    );
    console.log('Result:', query.toSQL());
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

run();
