import { db } from './src/database/db';
import { connectedAccounts } from './src/database/schema';
import { decrypt } from './src/shared/encryption';
import axios from 'axios';

async function subscribe() {
  const accounts = await db.select().from(connectedAccounts);
  if (accounts.length === 0) {
    console.log('No accounts found');
    return;
  }
  
  const account = accounts[0];
  const pageAccessToken = decrypt(account.encryptedPageAccessToken);
  const pageId = account.facebookPageId;
  
  console.log('Subscribing page', pageId, 'to app...');
  try {
    const res = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`, {
      subscribed_fields: ['messages', 'messaging_postbacks']
    }, {
      params: { access_token: pageAccessToken }
    });
    console.log('Success:', res.data);
  } catch (e: any) {
    console.error('Error:', e.response?.data || e.message);
  }
  process.exit(0);
}

subscribe();
