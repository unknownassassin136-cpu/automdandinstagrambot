import { db } from './src/database/db';
import { connectedAccounts } from './src/database/schema';

db.select().from(connectedAccounts)
  .then(res => console.log('ACCOUNTS:', res))
  .catch(console.error)
  .finally(() => process.exit(0));
