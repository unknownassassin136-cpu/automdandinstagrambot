"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const notifications_repository_1 = require("./notifications.repository");
class NotificationsController {
    repo = new notifications_repository_1.NotificationsRepository();
    getMyNotifications = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const notifications = await this.repo.getByUserId(userId);
            res.status(200).json(notifications);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    markAsRead = async (req, res) => {
        try {
            await this.repo.markAsRead(req.params.id);
            res.status(200).json({ message: 'Marked as read' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.NotificationsController = NotificationsController;
