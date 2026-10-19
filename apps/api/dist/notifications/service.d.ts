import { NotificationRepository } from '@momera/database';
import { NotificationProvider, NotificationPayload } from './provider.js';
export declare class NotificationService {
    private notificationRepo;
    private provider;
    constructor(notificationRepo: NotificationRepository, provider: NotificationProvider);
    dispatch(outboxId: number, payload: NotificationPayload): Promise<void>;
    retry(outboxId: number): Promise<boolean>;
}
//# sourceMappingURL=service.d.ts.map