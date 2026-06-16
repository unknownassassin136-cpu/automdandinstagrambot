import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { RefreshTokenRepository } from './refresh-token.repository';

export class RefreshTokenService {
  constructor(private refreshTokenRepo: RefreshTokenRepository = new RefreshTokenRepository()) {}

  async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(token);
    
    // Refresh token expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await this.refreshTokenRepo.create(userId, tokenHash, expiresAt);
    
    // We sign the random string in a JWT so it's self-contained and verifiable
    return jwt.sign({ userId, token }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  async verifyAndRotateToken(refreshToken: string): Promise<{ userId: string; newRefreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; token: string };
      const tokenHash = this.hashToken(decoded.token);
      
      const storedToken = await this.refreshTokenRepo.findByHash(tokenHash);
      
      if (!storedToken) {
        throw new Error('Refresh token not found or already used');
      }
      
      if (storedToken.expiresAt < new Date()) {
        await this.refreshTokenRepo.deleteByHash(tokenHash);
        throw new Error('Refresh token expired');
      }
      
      // Token is valid. Rotate it.
      await this.refreshTokenRepo.deleteByHash(tokenHash); // revoke old token
      
      const newRefreshToken = await this.createRefreshToken(decoded.userId);
      
      return { userId: decoded.userId, newRefreshToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async revokeToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; token: string };
      const tokenHash = this.hashToken(decoded.token);
      await this.refreshTokenRepo.deleteByHash(tokenHash);
    } catch (err) {
      // If token is invalid/expired, it's effectively revoked
    }
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepo.deleteAllForUser(userId);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
