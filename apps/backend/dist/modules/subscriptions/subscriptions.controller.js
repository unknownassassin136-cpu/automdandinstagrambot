"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const subscriptions_service_1 = require("./subscriptions.service");
class SubscriptionsController {
    subsService = new subscriptions_service_1.SubscriptionsService();
    getBillingStatus = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const status = await this.subsService.getBillingStatus(userId);
            res.status(200).json(status);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    mockUpgrade = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const { planName } = req.body;
            if (!userId)
                throw new Error('Unauthorized');
            if (!['free', 'plus', 'pro'].includes(planName))
                throw new Error('Invalid plan name');
            await this.subsService.handleSubscriptionUpdate(userId, planName);
            const status = await this.subsService.getBillingStatus(userId);
            res.status(200).json(status);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.SubscriptionsController = SubscriptionsController;
