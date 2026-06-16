"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsController = void 0;
const accounts_service_1 = require("./accounts.service");
const zod_1 = require("zod");
const connectAccountSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'OAuth authorization code is required'),
});
class AccountsController {
    accountsService = new accounts_service_1.AccountsService();
    connect = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const data = connectAccountSchema.parse(req.body);
            const account = await this.accountsService.connectAccount(userId, data.code);
            res.status(201).json(account);
        }
        catch (err) {
            if (err.name === 'ZodError') {
                res.status(400).json({ error: err.errors });
            }
            else {
                res.status(400).json({ error: err.message });
            }
        }
    };
    list = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const accounts = await this.accountsService.getConnectedAccounts(userId);
            res.status(200).json(accounts);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    disconnect = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const accountId = req.params.accountId;
            await this.accountsService.disconnectAccount(userId, accountId);
            res.status(200).json({ message: 'Account disconnected successfully' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getMedia = async (req, res) => {
        try {
            console.log(`[AccountsController] getMedia called for account ${req.params.accountId}`);
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const accountId = req.params.accountId;
            const media = await this.accountsService.getAccountMedia(userId, accountId);
            res.status(200).json(media);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AccountsController = AccountsController;
