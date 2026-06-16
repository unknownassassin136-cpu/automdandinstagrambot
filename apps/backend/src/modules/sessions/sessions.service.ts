import { UAParser } from 'ua-parser-js';
import { SessionsRepository } from './sessions.repository';
import { Request } from 'express';

export class SessionsService {
  constructor(private sessionsRepo: SessionsRepository = new SessionsRepository()) {}

  async createSession(userId: string, req: Request) {
    const userAgentStr = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentStr);
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

  async getUserSessions(userId: string) {
    return await this.sessionsRepo.findByUserId(userId);
  }

  async terminateSession(sessionId: string) {
    await this.sessionsRepo.delete(sessionId);
  }

  async terminateAllUserSessions(userId: string) {
    await this.sessionsRepo.deleteAllForUser(userId);
  }

  async updateSessionActivity(sessionId: string) {
    await this.sessionsRepo.updateLastActive(sessionId);
  }
}
