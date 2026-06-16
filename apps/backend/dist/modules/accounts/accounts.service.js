"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const accounts_repository_1 = require("./accounts.repository");
const encryption_1 = require("../../shared/encryption");
class AccountsService {
    accountsRepo;
    constructor(accountsRepo = new accounts_repository_1.AccountsRepository()) {
        this.accountsRepo = accountsRepo;
    }
    async connectAccount(userId, authCode) {
        try {
            // 1. Exchange authCode for short-lived access token
            const tokenRes = await axios_1.default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
                params: {
                    client_id: env_1.env.META_APP_ID,
                    client_secret: env_1.env.META_APP_SECRET,
                    redirect_uri: env_1.env.FRONTEND_URL + '/oauth/callback',
                    code: authCode,
                }
            });
            const shortLivedToken = tokenRes.data.access_token;
            // 2. Exchange for long-lived access token
            const longLivedRes = await axios_1.default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: env_1.env.META_APP_ID,
                    client_secret: env_1.env.META_APP_SECRET,
                    fb_exchange_token: shortLivedToken,
                }
            });
            const longLivedToken = longLivedRes.data.access_token;
            // Calculate token expiry (usually 60 days)
            const expiresIn = longLivedRes.data.expires_in || (60 * 24 * 60 * 60);
            const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
            // 3. Get user pages
            const pagesRes = await axios_1.default.get('https://graph.facebook.com/v19.0/me/accounts', {
                params: { access_token: longLivedToken }
            });
            const page = pagesRes.data.data[0]; // For MVP, grab the first connected page
            if (!page)
                throw new Error('No Facebook pages found');
            const pageAccessToken = page.access_token;
            const pageId = page.id;
            const pageName = page.name;
            // 4. Get connected Instagram account
            const igRes = await axios_1.default.get(`https://graph.facebook.com/v19.0/${pageId}`, {
                params: {
                    fields: 'instagram_business_account{id,username}',
                    access_token: pageAccessToken
                }
            });
            const igAccount = igRes.data.instagram_business_account;
            if (!igAccount)
                throw new Error('No linked Instagram business account found on this page');
            // 5. Encrypt token and store in DB
            const encryptedToken = (0, encryption_1.encrypt)(pageAccessToken);
            return await this.accountsRepo.create({
                userId,
                facebookPageId: pageId,
                instagramBusinessAccountId: igAccount.id,
                pageName,
                instagramUsername: igAccount.username,
                encryptedPageAccessToken: encryptedToken,
                tokenExpiresAt,
            });
        }
        catch (err) {
            console.error('Meta OAuth Error:', err.response?.data || err.message);
            throw new Error('Failed to connect Meta account');
        }
    }
    async getConnectedAccounts(userId) {
        const accounts = await this.accountsRepo.findByUserId(userId);
        // Remove encrypted token before sending to client
        return accounts.map(acc => {
            const { encryptedPageAccessToken, ...safeAcc } = acc;
            return safeAcc;
        });
    }
    async disconnectAccount(userId, accountId) {
        const account = await this.accountsRepo.findById(accountId);
        if (!account)
            throw new Error('Account not found');
        if (account.userId !== userId)
            throw new Error('Unauthorized');
        await this.accountsRepo.softDelete(accountId);
    }
    async getAccountMedia(userId, accountId) {
        const account = await this.accountsRepo.findById(accountId);
        if (!account)
            throw new Error('Account not found');
        if (account.userId !== userId)
            throw new Error('Unauthorized');
        const accessToken = (0, encryption_1.decrypt)(account.encryptedPageAccessToken);
        const igAccountId = account.instagramBusinessAccountId;
        try {
            const res = await axios_1.default.get(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
                params: {
                    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                    access_token: accessToken,
                    limit: 100
                }
            });
            return res.data.data;
        }
        catch (err) {
            console.error('Error fetching IG media:', err.response?.data || err.message);
            throw new Error('Failed to fetch Instagram media');
        }
    }
}
exports.AccountsService = AccountsService;
