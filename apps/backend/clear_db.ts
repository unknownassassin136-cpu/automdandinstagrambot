import { db } from './src/database/db';
import { connectedAccounts, automationRules } from './src/database/schema';

async function clearDb() {
  console.log('Clearing automation rules...');
  await db.delete(automationRules);
  
  console.log('Clearing connected accounts...');
  await db.delete(connectedAccounts);
  
  console.log('Database cleared of all accounts and rules. Users remain intact.');
  process.exit(0);
}

clearDb().catch(console.error);
