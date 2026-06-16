"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsRouter = void 0;
const express_1 = require("express");
const announcements_controller_1 = require("./announcements.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
exports.announcementsRouter = (0, express_1.Router)();
const controller = new announcements_controller_1.AnnouncementsController();
exports.announcementsRouter.use(auth_middleware_1.authMiddleware);
// Public (to authenticated users)
exports.announcementsRouter.get('/active', controller.getActive);
// Admin only
exports.announcementsRouter.get('/', (0, role_middleware_1.roleMiddleware)('admin'), controller.getAll);
exports.announcementsRouter.post('/', (0, role_middleware_1.roleMiddleware)('admin'), controller.create);
