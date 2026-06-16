"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
class AnalyticsController {
    analyticsService = new analytics_service_1.AnalyticsService();
    getDashboardStats = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const stats = await this.analyticsService.getDashboardStats(userId);
            res.status(200).json(stats);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getRecentLogs = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const limit = Number(req.query.limit) || 10;
            const logs = await this.analyticsService.getRecentLogs(userId, limit);
            res.status(200).json(logs);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AnalyticsController = AnalyticsController;
