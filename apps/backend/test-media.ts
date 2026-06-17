import { AccountsService } from './src/modules/accounts/accounts.service';
import { initDatabase } from './src/database/db';
import { AccountsRepository } from './src/modules/accounts/accounts.repository';
import { decrypt } from './src/shared/encryption';
import axios from 'axios';

async function test() {
  await initDatabase();
  const repo = new AccountsRepository();
  const account = await repo.findById('74ec35c8-acb2-4bb0-bd04-1fc714991b96');
  if (!account) return console.log("Account not found");

  const accessToken = decrypt(account.encryptedPageAccessToken);
  const igAccountId = account.instagramBusinessAccountId;

  console.log("Testing me/media with v22.0");
  try {
    const res = await axios.get(`https://graph.instagram.com/v22.0/me/media`, {
      params: { access_token: accessToken }
    });
    console.log("me/media v22.0 Success!", res.data);
  } catch(err: any) {
    console.log("me/media v22.0 Failed!", err.response?.data);
  }

  console.log("Testing IG_ACCOUNT_ID/media with v22.0");
  try {
    const res = await axios.get(`https://graph.instagram.com/v22.0/${igAccountId}/media`, {
      params: { access_token: accessToken }
    });
    console.log("ID/media v22.0 Success!", res.data);
  } catch(err: any) {
    console.log("ID/media v22.0 Failed!", err.response?.data);
  }
}

test();
