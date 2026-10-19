import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const services = sqliteTable('services', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tagline: text('tagline'),
    description: text('description').notNull(),
    starting_price_paise: integer('starting_price_paise').notNull(),
    cover_image_url: text('cover_image_url'),
    is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    display_order: integer('display_order').notNull().default(0),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    slugIdx: index('idx_services_slug').on(table.slug),
    activeOrderIdx: index('idx_services_active_order').on(table.is_active, table.display_order),
}));
export const enquiries = sqliteTable('enquiries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    reference_code: text('reference_code').notNull().unique(),
    customer_name: text('customer_name').notNull(),
    customer_phone: text('customer_phone').notNull(),
    service_id: integer('service_id')
        .notNull()
        .references(() => services.id),
    event_date: text('event_date').notNull(),
    event_time: text('event_time').notNull(),
    event_area: text('event_area').notNull(),
    recipient_relationship: text('recipient_relationship').notNull(),
    description: text('description').notNull(),
    budget_paise: integer('budget_paise'),
    additional_preferences: text('additional_preferences'),
    status: text('status', {
        enum: ['NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    })
        .notNull()
        .default('NEW'),
    quoted_price_paise: integer('quoted_price_paise'),
    idempotency_key: text('idempotency_key').notNull().unique(),
    privacy_consent_at: text('privacy_consent_at').notNull(),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    statusIdx: index('idx_enquiries_status').on(table.status),
    createdAtIdx: index('idx_enquiries_created_at').on(table.created_at),
    eventDateIdx: index('idx_enquiries_event_date').on(table.event_date),
    idempotencyIdx: index('idx_enquiries_idempotency').on(table.idempotency_key),
}));
export const admin_users = sqliteTable('admin_users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    full_name: text('full_name').notNull().default('Royal Concierge Admin'),
    is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
});
export const enquiry_notes = sqliteTable('enquiry_notes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    enquiry_id: integer('enquiry_id')
        .notNull()
        .references(() => enquiries.id, { onDelete: 'cascade' }),
    admin_id: integer('admin_id')
        .notNull()
        .references(() => admin_users.id),
    note: text('note').notNull(),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    enquiryIdx: index('idx_enquiry_notes_enquiry').on(table.enquiry_id),
}));
export const admin_sessions = sqliteTable('admin_sessions', {
    id: text('id').primaryKey(),
    admin_id: integer('admin_id')
        .notNull()
        .references(() => admin_users.id, { onDelete: 'cascade' }),
    session_hash: text('session_hash').notNull().unique(),
    expires_at: text('expires_at').notNull(),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    sessionHashIdx: index('idx_admin_sessions_hash').on(table.session_hash),
    expiresAtIdx: index('idx_admin_sessions_expires').on(table.expires_at),
}));
export const business_settings = sqliteTable('business_settings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    setting_key: text('setting_key').notNull().unique(),
    setting_value: text('setting_value').notNull(),
    updated_at: text('updated_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
});
export const notification_outbox = sqliteTable('notification_outbox', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    enquiry_id: integer('enquiry_id').references(() => enquiries.id, {
        onDelete: 'cascade',
    }),
    channel: text('channel').notNull().default('whatsapp'),
    recipient: text('recipient').notNull(),
    template_key: text('template_key').notNull(),
    payload_json: text('payload_json').notNull(),
    status: text('status', {
        enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DISABLED'],
    })
        .notNull()
        .default('PENDING'),
    attempt_count: integer('attempt_count').notNull().default(0),
    next_attempt_at: text('next_attempt_at'),
    last_error: text('last_error'),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    statusNextIdx: index('idx_outbox_status').on(table.status, table.next_attempt_at),
}));
export const admin_audit_logs = sqliteTable('admin_audit_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    admin_id: integer('admin_id').references(() => admin_users.id),
    action: text('action').notNull(),
    entity_type: text('entity_type').notNull(),
    entity_id: text('entity_id'),
    metadata_json: text('metadata_json'),
    created_at: text('created_at').notNull().default(sql `(CURRENT_TIMESTAMP)`),
}, (table) => ({
    actionIdx: index('idx_audit_logs_action').on(table.action, table.created_at),
}));
//# sourceMappingURL=index.js.map