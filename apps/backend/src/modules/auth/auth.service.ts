import argon2 from 'argon2';
import { UsersRepository } from '../users/users.repository';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { generateAccessToken } from '../../shared/jwt';

export class AuthService {
  constructor(
    private usersRepo: UsersRepository = new UsersRepository(),
    private refreshTokenService: RefreshTokenService = new RefreshTokenService()
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.usersRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password);
    
    const user = await this.usersRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      provider: 'email',
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role || 'user' });
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      }
    };
  }

  async login(data: LoginDto) {
    const user = await this.usersRepo.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role || 'user' });
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      }
    };
  }

  async refreshTokens(token: string) {
    const { userId, newRefreshToken } = await this.refreshTokenService.verifyAndRotateToken(token);
    const user = await this.usersRepo.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role || 'user' });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenService.revokeToken(refreshToken);
  }

  async logoutAllSessions(userId: string) {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
