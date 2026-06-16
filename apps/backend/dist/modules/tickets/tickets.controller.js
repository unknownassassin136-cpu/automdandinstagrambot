"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const tickets_repository_1 = require("./tickets.repository");
class TicketsController {
    repo = new tickets_repository_1.TicketsRepository();
    getMyTickets = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const tickets = await this.repo.getByUserId(userId);
            res.status(200).json(tickets);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getAllTickets = async (req, res) => {
        try {
            const tickets = await this.repo.getAll();
            res.status(200).json(tickets);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    createTicket = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const ticket = await this.repo.create({ ...req.body, userId });
            res.status(201).json(ticket);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    updateStatus = async (req, res) => {
        try {
            const ticket = await this.repo.updateStatus(req.params.id, req.body.status);
            res.status(200).json(ticket);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.TicketsController = TicketsController;
