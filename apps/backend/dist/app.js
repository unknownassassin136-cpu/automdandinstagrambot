"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const auth_routes_1 = require("./modules/auth/auth.routes");
const sessions_routes_1 = require("./modules/sessions/sessions.routes");
const users_routes_1 = require("./modules/users/users.routes");
const automations_routes_1 = require("./modules/automations/automations.routes");
const accounts_routes_1 = require("./modules/accounts/accounts.routes");
const webhooks_routes_1 = require("./modules/webhooks/webhooks.routes");
const analytics_routes_1 = require("./modules/analytics/analytics.routes");
const subscriptions_routes_1 = require("./modules/subscriptions/subscriptions.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const announcements_routes_1 = require("./modules/announcements/announcements.routes");
const tickets_routes_1 = require("./modules/tickets/tickets.routes");
const notifications_routes_1 = require("./modules/notifications/notifications.routes");
exports.app = (0, express_1.default)();
// Security Middleware
exports.app.use((0, helmet_1.default)());
exports.app.use((0, hpp_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use((0, morgan_1.default)('dev'));
// Trust proxy for rate limiting behind load balancers
exports.app.set('trust proxy', 1);
// Rate Limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
exports.app.use('/api/', limiter);
// Body Parsing
exports.app.use(express_1.default.json({
    limit: '10kb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// Mount Routers
exports.app.use('/api/v1/auth', auth_routes_1.authRouter);
exports.app.use('/api/v1/sessions', sessions_routes_1.sessionsRouter);
exports.app.use('/api/v1/users', users_routes_1.usersRouter);
exports.app.use('/api/v1/accounts', accounts_routes_1.accountsRouter);
exports.app.use('/api/v1/automations', automations_routes_1.automationsRouter);
exports.app.use('/api/v1/analytics', analytics_routes_1.analyticsRouter);
exports.app.use('/api/v1/subscriptions', subscriptions_routes_1.subscriptionsRouter);
exports.app.use('/api/v1/admin', admin_routes_1.adminRouter);
exports.app.use('/api/v1/announcements', announcements_routes_1.announcementsRouter);
exports.app.use('/api/v1/tickets', tickets_routes_1.ticketsRouter);
exports.app.use('/api/v1/notifications', notifications_routes_1.notificationsRouter);
// Mount Webhook Router
exports.app.use('/webhook', webhooks_routes_1.webhooksRouter);
// Logging
exports.app.use((0, morgan_1.default)('dev'));
// Basic Routes
exports.app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
