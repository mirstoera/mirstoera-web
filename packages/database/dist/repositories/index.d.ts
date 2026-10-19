import { DatabaseExecutor } from '../adapters/index.js';
import { ServiceEntity, EnquiryEntity, EnquiryNoteEntity, AdminUserEntity, PublicSettings, AdminSettings, NotificationOutboxEntity, AdminAuditLogEntity, DashboardMetrics, EnquiryStatus, NotificationStatus } from '@momera/shared';
export declare class ServiceRepository {
    private db;
    constructor(db: DatabaseExecutor);
    getAllActive(): Promise<ServiceEntity[]>;
    getAll(): Promise<ServiceEntity[]>;
    getBySlug(slug: string): Promise<ServiceEntity | null>;
    getById(id: number): Promise<ServiceEntity | null>;
    create(data: {
        slug: string;
        title: string;
        tagline?: string;
        description: string;
        starting_price_paise: number;
        cover_image_url?: string | null;
        is_active?: boolean;
        display_order?: number;
    }): Promise<ServiceEntity>;
    update(id: number, data: Partial<ServiceEntity>): Promise<ServiceEntity | null>;
}
export declare class EnquiryRepository {
    private db;
    constructor(db: DatabaseExecutor);
    generateNextReferenceCode(executor?: DatabaseExecutor): Promise<string>;
    getByIdempotencyKey(key: string, executor?: DatabaseExecutor): Promise<EnquiryEntity | null>;
    getByReferenceCode(code: string): Promise<EnquiryEntity | null>;
    getById(id: number): Promise<EnquiryEntity | null>;
    create(data: {
        customer_name: string;
        customer_phone: string;
        service_id: number;
        event_date: string;
        event_time: string;
        event_area: string;
        recipient_relationship: string;
        description: string;
        budget_paise?: number | null;
        additional_preferences?: string | null;
        idempotency_key: string;
        privacy_consent_at: string;
    }, executor?: DatabaseExecutor): Promise<EnquiryEntity>;
    list(params: {
        status?: string;
        service_slug?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: EnquiryEntity[];
        total: number;
    }>;
    updateStatus(id: number, status: EnquiryStatus, quotedPricePaise?: number | null): Promise<EnquiryEntity | null>;
}
export declare class EnquiryNoteRepository {
    private db;
    constructor(db: DatabaseExecutor);
    addNote(enquiryId: number, adminId: number, note: string): Promise<EnquiryNoteEntity>;
    getNotesByEnquiry(enquiryId: number): Promise<EnquiryNoteEntity[]>;
}
export declare class AdminRepository {
    private db;
    constructor(db: DatabaseExecutor);
    findByEmail(email: string): Promise<(AdminUserEntity & {
        password_hash: string;
    }) | null>;
    findById(id: number): Promise<AdminUserEntity | null>;
    createSession(id: string, adminId: number, sessionHash: string, expiresAt: string): Promise<void>;
    findSession(sessionHash: string): Promise<{
        admin: AdminUserEntity;
        expires_at: string;
    } | null>;
    deleteSession(sessionHash: string): Promise<void>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
}
export declare class SettingsRepository {
    private db;
    constructor(db: DatabaseExecutor);
    getAll(): Promise<Record<string, string>>;
    getPublic(): Promise<PublicSettings>;
    getAdminSettings(): Promise<AdminSettings>;
    updateSettings(entries: Record<string, string>): Promise<void>;
}
export declare class NotificationRepository {
    private db;
    constructor(db: DatabaseExecutor);
    createOutboxRecord(record: {
        enquiry_id: number;
        channel: string;
        recipient: string;
        template_key: string;
        payload_json: string;
        status?: NotificationStatus;
    }, executor?: DatabaseExecutor): Promise<NotificationOutboxEntity>;
    updateStatus(id: number, status: NotificationStatus, lastError?: string | null): Promise<void>;
    getAll(limit?: number): Promise<NotificationOutboxEntity[]>;
}
export declare class AuditRepository {
    private db;
    constructor(db: DatabaseExecutor);
    log(action: string, entityType: string, entityId: string | null, adminId: number | null, metadata?: any): Promise<void>;
    getLogs(limit?: number): Promise<AdminAuditLogEntity[]>;
}
//# sourceMappingURL=index.d.ts.map