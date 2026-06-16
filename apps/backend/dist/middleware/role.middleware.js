"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const db_1 = require("../database/db");
const schema_1 = require("../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const roleMiddleware = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user || user.role !== requiredRole) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
        catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
