"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_repository_1 = require("./admin.repository");
class AdminController {
    adminRepo = new admin_repository_1.AdminRepository();
    getAuditLogs = async (req, res) => {
        try {
            const logs = await this.adminRepo.getAuditLogs();
            res.status(200).json(logs);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getWebhookEvents = async (req, res) => {
        try {
            const events = await this.adminRepo.getWebhookEvents();
            res.status(200).json(events);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AdminController = AdminController;
