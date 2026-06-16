"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const announcements_repository_1 = require("./announcements.repository");
class AnnouncementsController {
    repo = new announcements_repository_1.AnnouncementsRepository();
    getActive = async (req, res) => {
        try {
            const active = await this.repo.getActiveAnnouncements();
            res.status(200).json(active);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getAll = async (req, res) => {
        try {
            const all = await this.repo.getAll();
            res.status(200).json(all);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    create = async (req, res) => {
        try {
            const announcement = await this.repo.create(req.body);
            res.status(201).json(announcement);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AnnouncementsController = AnnouncementsController;
