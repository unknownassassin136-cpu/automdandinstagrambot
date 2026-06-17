import { db } from './src/database/db';
import { connectedAccounts } from './src/database/schema';

async function getAccounts() {
  const accounts = await db.select({ 
    id: connectedAccounts.instagramBusinessAccountId, 
    name: connectedAccounts.instagramUsername 
  }).from(connectedAccounts);
  console.log(accounts);
  process.exit(0);
}

getAccounts().catch(console.error);
