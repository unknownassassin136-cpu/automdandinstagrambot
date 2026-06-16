import { Router, Request, Response } from 'express';
import { SessionsService } from './sessions.service';
import { authMiddleware } from '../../middleware/auth.middleware';

export const sessionsRouter = Router();
const sessionsService = new SessionsService();

sessionsRouter.use(authMiddleware);

sessionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const sessions = await sessionsService.getUserSessions(userId);
    res.status(200).json(sessions);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

sessionsRouter.delete('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await sessionsService.terminateSession(sessionId);
    res.status(200).json({ message: 'Session terminated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

sessionsRouter.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    await sessionsService.terminateAllUserSessions(userId);
    res.status(200).json({ message: 'All sessions terminated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
