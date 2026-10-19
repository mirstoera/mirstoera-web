import { Router } from 'express';
import { createAuthMiddleware } from '../middleware/auth.js';
import { adminLoginRateLimiter } from '../middleware/rateLimit.js';
export function createAdminRoutes(controller, adminRepo) {
    const router = Router();
    const requireAdmin = createAuthMiddleware(adminRepo);
    // Authentication routes
    router.post('/login', adminLoginRateLimiter, controller.login);
    router.post('/logout', controller.logout);
    router.get('/session', requireAdmin, controller.getSession);
    // Dashboard & Enquiries
    router.get('/dashboard', requireAdmin, controller.getDashboard);
    router.get('/enquiries', requireAdmin, controller.getEnquiries);
    router.get('/enquiries/:id', requireAdmin, controller.getEnquiryById);
    router.patch('/enquiries/:id/status', requireAdmin, controller.updateEnquiryStatus);
    router.post('/enquiries/:id/notes', requireAdmin, controller.addEnquiryNote);
    // Services
    router.get('/services', requireAdmin, controller.getServices);
    router.post('/services', requireAdmin, controller.createService);
    router.patch('/services/:id', requireAdmin, controller.updateService);
    // Settings
    router.get('/settings', requireAdmin, controller.getSettings);
    router.patch('/settings', requireAdmin, controller.updateSettings);
    // Notifications
    router.get('/notifications', requireAdmin, controller.getNotifications);
    router.post('/notifications/:id/retry', requireAdmin, controller.retryNotification);
    // Audit Logs
    router.get('/audit-logs', requireAdmin, controller.getAuditLogs);
    return router;
}
//# sourceMappingURL=adminRoutes.js.map