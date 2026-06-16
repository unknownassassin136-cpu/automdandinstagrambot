"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const ua_parser_js_1 = require("ua-parser-js");
const sessions_repository_1 = require("./sessions.repository");
class SessionsService {
    sessionsRepo;
    constructor(sessionsRepo = new sessions_repository_1.SessionsRepository()) {
        this.sessionsRepo = sessionsRepo;
    }
    async createSession(userId, req) {
        const userAgentStr = req.headers['user-agent'] || '';
        const parser = new ua_parser_js_1.UAParser(userAgentStr);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();
        const deviceName = device.model || os.name || 'Unknown Device';
        const browserName = browser.name || 'Unknown Browser';
        // Getting IP address from express
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        return await this.sessionsRepo.create({
            userId,
            deviceName: `${deviceName} (${os.version || ''})`.trim(),
            browser: `${browserName} ${browser.version || ''}`.trim(),
            ipAddress,
        });
    }
    async getUserSessions(userId) {
        return await this.sessionsRepo.findByUserId(userId);
    }
    async terminateSession(sessionId) {
        await this.sessionsRepo.delete(sessionId);
    }
    async terminateAllUserSessions(userId) {
        await this.sessionsRepo.deleteAllForUser(userId);
    }
    async updateSessionActivity(sessionId) {
        await this.sessionsRepo.updateLastActive(sessionId);
    }
}
exports.SessionsService = SessionsService;
