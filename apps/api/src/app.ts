import express, { Express } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {
  createDatabaseAdapter,
  DatabaseExecutor,
  ServiceRepository,
  EnquiryRepository,
  EnquiryNoteRepository,
  AdminRepository,
  SettingsRepository,
  NotificationRepository,
  AuditRepository,
} from '@momera/database';
import { createNotificationProvider } from './notifications/provider.js';
import { NotificationService } from './notifications/service.js';
import { PublicController } from './controllers/publicController.js';
import { AdminController } from './controllers/adminController.js';
import { createPublicRoutes } from './routes/publicRoutes.js';
import { createAdminRoutes } from './routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { config } from './config/index.js';

export interface AppDependencies {
  db?: DatabaseExecutor;
}

export function createApp(deps: AppDependencies = {}): { app: Express; db: DatabaseExecutor } {
  const app = express();
  const db = deps.db || createDatabaseAdapter(config.databaseMode, config.databasePath);

  // Repositories
  const serviceRepo = new ServiceRepository(db);
  const enquiryRepo = new EnquiryRepository(db);
  const enquiryNoteRepo = new EnquiryNoteRepository(db);
  const adminRepo = new AdminRepository(db);
  const settingsRepo = new SettingsRepository(db);
  const notificationRepo = new NotificationRepository(db);
  const auditRepo = new AuditRepository(db);

  // Notification Service
  const provider = createNotificationProvider();
  const notificationService = new NotificationService(notificationRepo, provider);

  // Controllers
  const publicController = new PublicController(
    db,
    serviceRepo,
    enquiryRepo,
    settingsRepo,
    notificationRepo,
    notificationService
  );

  const adminController = new AdminController(
    adminRepo,
    enquiryRepo,
    enquiryNoteRepo,
    serviceRepo,
    settingsRepo,
    notificationRepo,
    auditRepo,
    notificationService
  );

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled per deployment or allow Vite dev proxies
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: [config.appUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Idempotency-Key'],
    })
  );

  app.use(cookieParser(config.sessionSecret));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // API Routes
  app.use('/api', createPublicRoutes(publicController));
  app.use('/api/admin', createAdminRoutes(adminController, adminRepo));

  // Unified Frontend Static Assets & SPA Routing (Combines Frontend + Backend in ONE)
  const candidateDistPaths = [
    path.resolve(process.cwd(), 'apps/web/dist'),
    path.resolve(process.cwd(), '../web/dist'),
    path.resolve(process.cwd(), '../../apps/web/dist'),
    path.resolve(process.cwd(), 'dist'),
  ];
  const webDistPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

  if (webDistPath) {
    app.use(express.static(webDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(webDistPath, 'index.html'));
    });
  }

  // 404 & Error Handling for unmatched API endpoints
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, db };
}
