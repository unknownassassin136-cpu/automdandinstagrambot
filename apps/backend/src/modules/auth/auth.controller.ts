import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionsService } from '../sessions/sessions.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.dto';

export class AuthController {
  private authService = new AuthService();
  private sessionsService = new SessionsService();

  register = async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.authService.register(data);
      
      // Create session
      await this.sessionsService.createSession(result.user.id, req);
      
      res.status(201).json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({ error: err.errors });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.authService.login(data);
      
      // Create session
      await this.sessionsService.createSession(result.user.id, req);
      
      res.status(200).json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({ error: err.errors });
      } else {
        res.status(401).json({ error: err.message });
      }
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const result = await this.authService.refreshTokens(data.refreshToken);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const data = refreshTokenSchema.parse(req.body);
      await this.authService.logout(data.refreshToken);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err: any) {
      res.status(400).json({ error: 'Invalid request' });
    }
  };

  logoutAll = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      
      await this.authService.logoutAllSessions(userId);
      res.status(200).json({ message: 'Logged out from all sessions successfully' });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  };
}
