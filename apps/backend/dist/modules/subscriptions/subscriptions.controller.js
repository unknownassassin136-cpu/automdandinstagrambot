"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const subscriptions_service_1 = require("./subscriptions.service");
class SubscriptionsController {
    subsService = new subscriptions_service_1.SubscriptionsService();
    getSubscription = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const sub = await this.subsService.getSubscription(userId);
            res.status(200).json(sub);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.SubscriptionsController = SubscriptionsController;
