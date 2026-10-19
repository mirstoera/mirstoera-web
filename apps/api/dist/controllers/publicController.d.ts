import { Request, Response, NextFunction } from 'express';
import { ServiceRepository, EnquiryRepository, SettingsRepository, NotificationRepository, DatabaseExecutor } from '@momera/database';
import { NotificationService } from '../notifications/service.js';
export declare class PublicController {
    private db;
    private serviceRepo;
    private enquiryRepo;
    private settingsRepo;
    private notificationRepo;
    private notificationService;
    constructor(db: DatabaseExecutor, serviceRepo: ServiceRepository, enquiryRepo: EnquiryRepository, settingsRepo: SettingsRepository, notificationRepo: NotificationRepository, notificationService: NotificationService);
    getHealth: (_req: Request, res: Response) => Promise<void>;
    getServices: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceBySlug: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicSettings: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    submitEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=publicController.d.ts.map