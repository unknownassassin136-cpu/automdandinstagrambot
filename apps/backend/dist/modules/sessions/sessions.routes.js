"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRouter = void 0;
const express_1 = require("express");
const sessions_service_1 = require("./sessions.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.sessionsRouter = (0, express_1.Router)();
const sessionsService = new sessions_service_1.SessionsService();
exports.sessionsRouter.use(auth_middleware_1.authMiddleware);
exports.sessionsRouter.get('/', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const sessions = await sessionsService.getUserSessions(userId);
        res.status(200).json(sessions);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.sessionsRouter.delete('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        await sessionsService.terminateSession(sessionId);
        res.status(200).json({ message: 'Session terminated' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.sessionsRouter.delete('/', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new Error('Unauthorized');
        await sessionsService.terminateAllUserSessions(userId);
        res.status(200).json({ message: 'All sessions terminated' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
