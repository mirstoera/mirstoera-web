import { EnquiryStatus, NotificationStatus } from '../constants/index.js';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
export interface ServiceEntity {
    id: number;
    slug: string;
    title: string;
    tagline: string | null;
    description: string;
    starting_price_paise: number;
    starting_price_inr: number;
    cover_image_url?: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}
export interface EnquiryEntity {
    id: number;
    reference_code: string;
    customer_name: string;
    customer_phone: string;
    service_id: number;
    service_slug?: string;
    service_title?: string;
    event_date: string;
    event_time: string;
    event_area: string;
    recipient_relationship: string;
    description: string;
    budget_paise: number | null;
    budget_inr?: number | null;
    additional_preferences: string | null;
    status: EnquiryStatus;
    quoted_price_paise: number | null;
    quoted_price_inr?: number | null;
    idempotency_key: string;
    privacy_consent_at: string;
    created_at: string;
    updated_at: string;
}
export interface EnquiryNoteEntity {
    id: number;
    enquiry_id: number;
    admin_id: number;
    admin_email?: string;
    admin_name?: string;
    note: string;
    created_at: string;
}
export interface AdminUserEntity {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface PublicSettings {
    brand_name: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    email: string;
    service_coverage: string;
    business_hours: string;
    instagram_url?: string;
    facebook_url?: string;
    youtube_url?: string;
    twitter_url?: string;
}
export interface AdminSettings extends PublicSettings {
    notification_recipient: string;
    notification_provider_status: 'ready' | 'manual_only' | 'unconfigured';
}
export interface NotificationOutboxEntity {
    id: number;
    enquiry_id: number | null;
    channel: string;
    recipient: string;
    template_key: string;
    payload_json: string;
    status: NotificationStatus;
    attempt_count: number;
    next_attempt_at: string | null;
    last_error: string | null;
    created_at: string;
    updated_at: string;
}
export interface AdminAuditLogEntity {
    id: number;
    admin_id: number | null;
    admin_email?: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    metadata_json: string | null;
    created_at: string;
}
export interface DashboardMetrics {
    total: number;
    new: number;
    contacted: number;
    quoted: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}
//# sourceMappingURL=index.d.ts.map