"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const users_repository_1 = require("./users.repository");
class UsersService {
    usersRepo;
    constructor(usersRepo = new users_repository_1.UsersRepository()) {
        this.usersRepo = usersRepo;
    }
    async getUserProfile(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Omit sensitive data
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async updateUserProfile(userId, data) {
        const updatedUser = await this.usersRepo.update(userId, data);
        const { passwordHash, ...safeUser } = updatedUser;
        return safeUser;
    }
}
exports.UsersService = UsersService;
