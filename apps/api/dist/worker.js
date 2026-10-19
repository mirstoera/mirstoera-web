import { createDatabaseAdapter, ServiceRepository, EnquiryRepository, SettingsRepository, NotificationRepository, AuditRepository, AdminRepository, EnquiryNoteRepository, } from '@momera/database';
import { ManualNotificationProvider } from './notifications/provider.js';
import { NotificationService } from './notifications/service.js';
import { enquirySubmissionSchema } from '@momera/shared';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const db = createDatabaseAdapter('d1', '', env.DB);
        const serviceRepo = new ServiceRepository(db);
        const enquiryRepo = new EnquiryRepository(db);
        const enquiryNoteRepo = new EnquiryNoteRepository(db);
        const adminRepo = new AdminRepository(db);
        const settingsRepo = new SettingsRepository(db);
        const notificationRepo = new NotificationRepository(db);
        const auditRepo = new AuditRepository(db);
        const provider = new ManualNotificationProvider();
        const notificationService = new NotificationService(notificationRepo, provider);
        const json = (data, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Idempotency-Key',
            },
        });
        if (request.method === 'OPTIONS') {
            return json({}, 204);
        }
        try {
            // 1. GET /api/health
            if (url.pathname === '/api/health' && request.method === 'GET') {
                return json({
                    success: true,
                    data: {
                        status: 'healthy',
                        runtime: 'cloudflare_worker',
                        database: 'd1_connected',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            // 2. GET /api/services
            if (url.pathname === '/api/services' && request.method === 'GET') {
                const services = await serviceRepo.getAllActive();
                return json({ success: true, data: services });
            }
            // 3. GET /api/public-settings
            if (url.pathname === '/api/public-settings' && request.method === 'GET') {
                const settings = await settingsRepo.getPublic();
                return json({ success: true, data: settings });
            }
            // 4. POST /api/enquiries
            if (url.pathname === '/api/enquiries' && request.method === 'POST') {
                const body = await request.json();
                const validated = enquirySubmissionSchema.parse(body);
                const existing = await enquiryRepo.getByIdempotencyKey(validated.idempotency_key);
                if (existing) {
                    return json({
                        success: true,
                        data: {
                            id: existing.id,
                            reference_code: existing.reference_code,
                            status: existing.status,
                            created_at: existing.created_at,
                        },
                        message: 'Your royal request was already safely received.',
                    }, 200);
                }
                const service = await serviceRepo.getBySlug(validated.service_slug);
                if (!service) {
                    return json({ success: false, error: { code: 'INVALID_SERVICE', message: 'Service not found' } }, 400);
                }
                let created;
                await db.transaction(async (tx) => {
                    created = await enquiryRepo.create({
                        customer_name: validated.customer_name,
                        customer_phone: validated.customer_phone,
                        service_id: service.id,
                        event_date: validated.event_date,
                        event_time: validated.event_time,
                        event_area: validated.event_area,
                        recipient_relationship: validated.recipient_relationship,
                        description: validated.description,
                        budget_paise: validated.budget_inr ? validated.budget_inr * 100 : null,
                        additional_preferences: validated.additional_preferences,
                        idempotency_key: validated.idempotency_key,
                        privacy_consent_at: new Date().toISOString(),
                    }, tx);
                    await notificationRepo.createOutboxRecord({
                        enquiry_id: created.id,
                        channel: 'whatsapp',
                        recipient: created.customer_phone,
                        template_key: 'mirstoera_enquiry_alert',
                        payload_json: JSON.stringify(created),
                        status: 'SENT',
                    }, tx);
                });
                return json({
                    success: true,
                    data: {
                        id: created.id,
                        reference_code: created.reference_code,
                        status: created.status,
                        created_at: created.created_at,
                    },
                    message: 'Your royal request has been received. Our concierge will contact you shortly.',
                }, 201);
            }
            return json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404);
        }
        catch (err) {
            return json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred. Please try again or contact concierge.',
                },
            }, 500);
        }
    },
};
//# sourceMappingURL=worker.js.map