import { Request, Response, NextFunction } from 'express';
import { AdminRepository, EnquiryRepository, EnquiryNoteRepository, ServiceRepository, SettingsRepository, NotificationRepository, AuditRepository } from '@momera/database';
import { NotificationService } from '../notifications/service.js';
export declare class AdminController {
    private adminRepo;
    private enquiryRepo;
    private enquiryNoteRepo;
    private serviceRepo;
    private settingsRepo;
    private notificationRepo;
    private auditRepo;
    private notificationService;
    constructor(adminRepo: AdminRepository, enquiryRepo: EnquiryRepository, enquiryNoteRepo: EnquiryNoteRepository, serviceRepo: ServiceRepository, settingsRepo: SettingsRepository, notificationRepo: NotificationRepository, auditRepo: AuditRepository, notificationService: NotificationService);
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSession: (req: Request, res: Response) => Promise<void>;
    getDashboard: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEnquiries: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEnquiryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateEnquiryStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addEnquiryNote: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getServices: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateService: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createService: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSettings: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateSettings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNotifications: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    retryNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditLogs: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=adminController.d.ts.map