import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './modules/auth/auth.routes';
import { sessionsRouter } from './modules/sessions/sessions.routes';
import { usersRouter } from './modules/users/users.routes';
import { automationsRouter } from './modules/automations/automations.routes';
import { accountsRouter } from './modules/accounts/accounts.routes';
import { webhooksRouter } from './modules/webhooks/webhooks.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { announcementsRouter } from './modules/announcements/announcements.routes';
import { ticketsRouter } from './modules/tickets/tickets.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';

export const app = express();

// Security Middleware
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(morgan('dev'));

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ 
  limit: '100kb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Mount Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/sessions', sessionsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/accounts', accountsRouter);
app.use('/api/v1/automations', automationsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/announcements', announcementsRouter);
app.use('/api/v1/tickets', ticketsRouter);
app.use('/api/v1/notifications', notificationsRouter);
// Mount Webhook Router
app.use('/webhook', webhooksRouter);

// Logging
app.use(morgan('dev'));

// Basic Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});
