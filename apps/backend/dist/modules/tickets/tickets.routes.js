"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketsRouter = void 0;
const express_1 = require("express");
const tickets_controller_1 = require("./tickets.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
exports.ticketsRouter = (0, express_1.Router)();
const controller = new tickets_controller_1.TicketsController();
exports.ticketsRouter.use(auth_middleware_1.authMiddleware);
// User
exports.ticketsRouter.get('/me', controller.getMyTickets);
exports.ticketsRouter.post('/', controller.createTicket);
// Admin
exports.ticketsRouter.get('/', (0, role_middleware_1.roleMiddleware)('admin'), controller.getAllTickets);
exports.ticketsRouter.patch('/:id/status', (0, role_middleware_1.roleMiddleware)('admin'), controller.updateStatus);
