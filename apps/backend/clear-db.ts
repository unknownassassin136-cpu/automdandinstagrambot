import { initDatabase, db } from './src/database/db';
import { connectedAccounts, automationRules } from './src/database/schema';

async function clearDB() {
  console.log("Connecting to database...");
  await initDatabase();
  
  console.log("Clearing automation rules...");
  await db.delete(automationRules);
  
  console.log("Clearing connected accounts...");
  await db.delete(connectedAccounts);
  
  console.log("Database cleared successfully!");
  process.exit(0);
}

clearDB().catch(console.error);
