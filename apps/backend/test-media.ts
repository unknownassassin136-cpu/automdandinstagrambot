import { AccountsService } from './src/modules/accounts/accounts.service';
import { db } from './src/database/db';
import { connectedAccounts } from './src/database/schema';
import { env } from './src/config/env';

async function test() {
  const service = new AccountsService();
  const accounts = await db.select().from(connectedAccounts);
  if (accounts.length === 0) {
    console.log('No accounts found');
    return;
  }
  const account = accounts[0];
  console.log('Testing account:', account.id, 'user:', account.userId);
  try {
    const media = await service.getAccountMedia(account.userId, account.id);
    console.log('Media fetched:', media.length);
  } catch (err: any) {
    console.error('Test failed:', err.message);
  }
}

test().catch(console.error).finally(() => process.exit(0));
