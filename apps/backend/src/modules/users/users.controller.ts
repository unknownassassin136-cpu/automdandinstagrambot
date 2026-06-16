import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  profileImageUrl: z.string().url().optional(),
});

export class UsersController {
  private usersService = new UsersService();

  getProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      
      const profile = await this.usersService.getUserProfile(userId);
      res.status(200).json(profile);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const data = updateProfileSchema.parse(req.body);
      const profile = await this.usersService.updateUserProfile(userId, data);
      res.status(200).json(profile);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({ error: err.errors });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  };
}
