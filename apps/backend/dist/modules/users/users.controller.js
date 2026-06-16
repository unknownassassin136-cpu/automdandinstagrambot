"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    profileImageUrl: zod_1.z.string().url().optional(),
});
class UsersController {
    usersService = new users_service_1.UsersService();
    getProfile = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const profile = await this.usersService.getUserProfile(userId);
            res.status(200).json(profile);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    };
    updateProfile = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const data = updateProfileSchema.parse(req.body);
            const profile = await this.usersService.updateUserProfile(userId, data);
            res.status(200).json(profile);
        }
        catch (err) {
            if (err.name === 'ZodError') {
                res.status(400).json({ error: err.errors });
            }
            else {
                res.status(400).json({ error: err.message });
            }
        }
    };
}
exports.UsersController = UsersController;
