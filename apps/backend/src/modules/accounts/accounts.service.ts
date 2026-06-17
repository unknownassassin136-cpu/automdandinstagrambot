import axios from 'axios';
import { env } from '../../config/env';
import { AccountsRepository } from './accounts.repository';
import { encrypt, decrypt } from '../../shared/encryption';

export class AccountsService {
  constructor(private accountsRepo: AccountsRepository = new AccountsRepository()) {}

  async connectAccount(userId: string, authCode: string) {
    try {
      // 1. Exchange authCode for short-lived access token
      const tokenForm = new URLSearchParams();
      tokenForm.append('client_id', env.INSTAGRAM_APP_ID);
      tokenForm.append('client_secret', env.INSTAGRAM_APP_SECRET);
      tokenForm.append('grant_type', 'authorization_code');
      tokenForm.append('redirect_uri', env.FRONTEND_URL + '/oauth/callback');
      tokenForm.append('code', authCode);

      const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', tokenForm.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const shortLivedToken = tokenRes.data.access_token;
      const igUserId = tokenRes.data.user_id;

      // 2. Exchange for long-lived access token
      const longLivedRes = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: env.INSTAGRAM_APP_SECRET,
          access_token: shortLivedToken,
        }
      });
      const longLivedToken = longLivedRes.data.access_token;
      
      // Calculate token expiry (usually 60 days)
      const expiresIn = longLivedRes.data.expires_in || (60 * 24 * 60 * 60);
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

      // 3. Get Instagram User Profile
      const igRes = await axios.get(`https://graph.instagram.com/v21.0/me`, {
        params: {
          fields: 'id,username,name',
          access_token: longLivedToken
        }
      });
      
      const igAccount = igRes.data;
      if (!igAccount || !igAccount.id) throw new Error('Could not fetch Instagram account profile');

      // 4. Automatically subscribe the Instagram account to webhooks
      try {
        await axios.post(
          'https://graph.instagram.com/v21.0/me/subscribed_apps',
          null,
          {
            params: { subscribed_fields: 'messages,comments' },
            headers: { Authorization: `Bearer ${longLivedToken}` }
          }
        );
        console.log(`✓ Successfully subscribed account ${igAccount.username} to messages/comments webhooks`);
      } catch (subErr: any) {
        console.error('Failed to automatically subscribe account to webhooks:', subErr.response?.data || subErr.message);
        // We don't throw here, as they might have a Creator account that doesn't permit it,
        // but we still want to save the account so they can at least use other features.
      }

      // 5. Encrypt token and store in DB
      const instagramId = igAccount.id.toString(); // Ensure string
      const accountData = {
        userId,
        facebookPageId: null as any, // Nullable now
        instagramBusinessAccountId: instagramId,
        pageName: null as any,
        instagramUsername: igAccount.username || igAccount.name || 'Unknown',
        encryptedPageAccessToken: encrypt(longLivedToken),
        tokenExpiresAt,
      };

      // Soft delete any existing connection for this instagram account
      // wait, actually we want to UPDATE if it belongs to this user!
      const existingAccounts = await this.accountsRepo.findByInstagramId(instagramId);
      
      let existingAccount = null;
      for (const existing of existingAccounts) {
        if (existing.userId === userId) {
           existingAccount = existing;
           break;
        } else {
           // If it belongs to a DIFFERENT user, soft delete it to prevent hijacking
           await this.accountsRepo.softDelete(existing.id);
        }
      }

      // 5. Save or Update in database
      if (existingAccount) {
        // Update the token on the existing account to preserve Automation Rules!
        const account = await this.accountsRepo.update(existingAccount.id, accountData);
        return account;
      } else {
        const account = await this.accountsRepo.create(accountData);
        return account;
      }

    } catch (err: any) {
      console.error('Meta/Instagram OAuth Error:', err.response?.data || err.message);
      throw new Error('Failed to connect Instagram account');
    }
  }

  async getConnectedAccounts(userId: string) {
    const accounts = await this.accountsRepo.findByUserId(userId);
    // Remove encrypted token before sending to client
    return accounts.map(acc => {
      const { encryptedPageAccessToken, ...safeAcc } = acc;
      return safeAcc;
    });
  }

  async disconnectAccount(userId: string, accountId: string) {
    const account = await this.accountsRepo.findById(accountId);
    if (!account) throw new Error('Account not found');
    if (account.userId !== userId) throw new Error('Unauthorized');
    
    await this.accountsRepo.softDelete(accountId);
  }

  async getAccountMedia(userId: string, accountId: string) {
    const account = await this.accountsRepo.findById(accountId);
    if (!account) throw new Error('Account not found');
    if (account.userId !== userId) throw new Error('Unauthorized');

    const accessToken = decrypt(account.encryptedPageAccessToken);
    const igAccountId = account.instagramBusinessAccountId;

    try {
      const res = await axios.get(`https://graph.instagram.com/v21.0/me/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          access_token: accessToken,
          limit: 100
        }
      });
      return res.data.data;
    } catch (err: any) {
      console.error('Error fetching IG media:', err.response?.data || err.message);
      throw new Error('Failed to fetch Instagram media');
    }
  }
}
