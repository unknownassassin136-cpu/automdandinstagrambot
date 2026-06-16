import { UsersRepository } from './users.repository';

export class UsersService {
  constructor(private usersRepo: UsersRepository = new UsersRepository()) {}

  async getUserProfile(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Omit sensitive data
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; profileImageUrl?: string }) {
    const updatedUser = await this.usersRepo.update(userId, data);
    
    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser;
  }
}
