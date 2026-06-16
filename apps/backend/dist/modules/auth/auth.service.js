"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const argon2_1 = __importDefault(require("argon2"));
const users_repository_1 = require("../users/users.repository");
const refresh_token_service_1 = require("./refresh-token.service");
const jwt_1 = require("../../shared/jwt");
class AuthService {
    usersRepo;
    refreshTokenService;
    constructor(usersRepo = new users_repository_1.UsersRepository(), refreshTokenService = new refresh_token_service_1.RefreshTokenService()) {
        this.usersRepo = usersRepo;
        this.refreshTokenService = refreshTokenService;
    }
    async register(data) {
        const existingUser = await this.usersRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const passwordHash = await argon2_1.default.hash(data.password);
        const user = await this.usersRepo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            passwordHash,
            provider: 'email',
        });
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role || 'user' });
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
    async login(data) {
        const user = await this.usersRepo.findByEmail(data.email);
        if (!user || !user.passwordHash) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await argon2_1.default.verify(user.passwordHash, data.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role || 'user' });
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
    async refreshTokens(token) {
        const { userId, newRefreshToken } = await this.refreshTokenService.verifyAndRotateToken(token);
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role || 'user' });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await this.refreshTokenService.revokeToken(refreshToken);
    }
    async logoutAllSessions(userId) {
        await this.refreshTokenService.revokeAllUserTokens(userId);
    }
}
exports.AuthService = AuthService;
