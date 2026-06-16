"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class UsersRepository {
    async findById(id) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user;
    }
    async findByEmail(email) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return user;
    }
    async create(data) {
        const [user] = await db_1.db.insert(schema_1.users).values(data).returning();
        return user;
    }
    async update(id, data) {
        const [user] = await db_1.db.update(schema_1.users)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return user;
    }
}
exports.UsersRepository = UsersRepository;
