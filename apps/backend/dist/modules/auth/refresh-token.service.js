"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const refresh_token_repository_1 = require("./refresh-token.repository");
class RefreshTokenService {
    refreshTokenRepo;
    constructor(refreshTokenRepo = new refresh_token_repository_1.RefreshTokenRepository()) {
        this.refreshTokenRepo = refreshTokenRepo;
    }
    async createRefreshToken(userId) {
        const token = crypto_1.default.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(token);
        // Refresh token expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepo.create(userId, tokenHash, expiresAt);
        // We sign the random string in a JWT so it's self-contained and verifiable
        return jsonwebtoken_1.default.sign({ userId, token }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
    async verifyAndRotateToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
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
        }
        catch (err) {
            throw new Error('Invalid refresh token');
        }
    }
    async revokeToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            const tokenHash = this.hashToken(decoded.token);
            await this.refreshTokenRepo.deleteByHash(tokenHash);
        }
        catch (err) {
            // If token is invalid/expired, it's effectively revoked
        }
    }
    async revokeAllUserTokens(userId) {
        await this.refreshTokenRepo.deleteAllForUser(userId);
    }
    hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
}
exports.RefreshTokenService = RefreshTokenService;
