"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const sessions_service_1 = require("../sessions/sessions.service");
const auth_dto_1 = require("./auth.dto");
class AuthController {
    authService = new auth_service_1.AuthService();
    sessionsService = new sessions_service_1.SessionsService();
    register = async (req, res) => {
        try {
            const data = auth_dto_1.registerSchema.parse(req.body);
            const result = await this.authService.register(data);
            // Create session
            await this.sessionsService.createSession(result.user.id, req);
            res.status(201).json(result);
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
    login = async (req, res) => {
        try {
            const data = auth_dto_1.loginSchema.parse(req.body);
            const result = await this.authService.login(data);
            // Create session
            await this.sessionsService.createSession(result.user.id, req);
            res.status(200).json(result);
        }
        catch (err) {
            if (err.name === 'ZodError') {
                res.status(400).json({ error: err.errors });
            }
            else {
                res.status(401).json({ error: err.message });
            }
        }
    };
    refreshToken = async (req, res) => {
        try {
            const data = auth_dto_1.refreshTokenSchema.parse(req.body);
            const result = await this.authService.refreshTokens(data.refreshToken);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    };
    logout = async (req, res) => {
        try {
            const data = auth_dto_1.refreshTokenSchema.parse(req.body);
            await this.authService.logout(data.refreshToken);
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (err) {
            res.status(400).json({ error: 'Invalid request' });
        }
    };
    logoutAll = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            await this.authService.logoutAllSessions(userId);
            res.status(200).json({ message: 'Logged out from all sessions successfully' });
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    };
}
exports.AuthController = AuthController;
