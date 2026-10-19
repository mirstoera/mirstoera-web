import { enquirySubmissionSchema } from '@momera/shared';
export class PublicController {
    db;
    serviceRepo;
    enquiryRepo;
    settingsRepo;
    notificationRepo;
    notificationService;
    constructor(db, serviceRepo, enquiryRepo, settingsRepo, notificationRepo, notificationService) {
        this.db = db;
        this.serviceRepo = serviceRepo;
        this.enquiryRepo = enquiryRepo;
        this.settingsRepo = settingsRepo;
        this.notificationRepo = notificationRepo;
        this.notificationService = notificationService;
    }
    getHealth = async (_req, res) => {
        res.json({
            success: true,
            data: {
                status: 'healthy',
                brand: 'MIRSTOERA',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                database: 'connected',
            },
            message: 'MIRSTOERA API service operational',
        });
    };
    getServices = async (_req, res, next) => {
        try {
            const activeServices = await this.serviceRepo.getAllActive();
            res.json({
                success: true,
                data: activeServices,
                message: 'Active royal experiences retrieved successfully',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getServiceBySlug = async (req, res, next) => {
        try {
            const { slug } = req.params;
            const service = await this.serviceRepo.getBySlug(slug);
            if (!service || !service.is_active) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: `Royal experience '${slug}' was not found.`,
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: service,
                message: 'Experience details retrieved',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getPublicSettings = async (_req, res, next) => {
        try {
            const settings = await this.settingsRepo.getPublic();
            res.json({
                success: true,
                data: settings,
                message: 'Public brand settings retrieved',
            });
        }
        catch (err) {
            next(err);
        }
    };
    submitEnquiry = async (req, res, next) => {
        try {
            // 1. Validate request body with Zod
            const validated = enquirySubmissionSchema.parse(req.body);
            // 2. Check Idempotency Key (Return existing enquiry if already processed)
            const existing = await this.enquiryRepo.getByIdempotencyKey(validated.idempotency_key);
            if (existing) {
                res.status(200).json({
                    success: true,
                    data: {
                        id: existing.id,
                        reference_code: existing.reference_code,
                        status: existing.status,
                        created_at: existing.created_at,
                    },
                    message: 'Your royal request was already safely received.',
                });
                return;
            }
            // 3. Resolve service record
            const service = await this.serviceRepo.getBySlug(validated.service_slug);
            if (!service || !service.is_active) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_SERVICE',
                        message: 'The selected experience is currently unavailable.',
                    },
                });
                return;
            }
            // 4. Atomic Transaction: Insert Enquiry + Outbox Record
            let createdEnquiry;
            let outboxRecord;
            await this.db.transaction(async (tx) => {
                // Safe reference code generation and insert
                createdEnquiry = await this.enquiryRepo.create({
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
                // Transactional Outbox record creation
                const payload = {
                    enquiryId: createdEnquiry.id,
                    referenceCode: createdEnquiry.reference_code,
                    customerName: createdEnquiry.customer_name,
                    customerPhone: createdEnquiry.customer_phone,
                    serviceTitle: service.title,
                    eventDate: createdEnquiry.event_date,
                    eventArea: createdEnquiry.event_area,
                };
                outboxRecord = await this.notificationRepo.createOutboxRecord({
                    enquiry_id: createdEnquiry.id,
                    channel: 'whatsapp',
                    recipient: createdEnquiry.customer_phone,
                    template_key: process.env.WHATSAPP_TEMPLATE_NAME || 'mirstoera_enquiry_alert',
                    payload_json: JSON.stringify(payload),
                    status: 'PENDING',
                }, tx);
            });
            // 5. Post-transaction notification dispatch (never blocks DB commit)
            if (outboxRecord) {
                const payload = {
                    enquiryId: createdEnquiry.id,
                    referenceCode: createdEnquiry.reference_code,
                    customerName: createdEnquiry.customer_name,
                    customerPhone: createdEnquiry.customer_phone,
                    serviceTitle: service.title,
                    eventDate: createdEnquiry.event_date,
                    eventArea: createdEnquiry.event_area,
                };
                // Asynchronous fire-and-update
                this.notificationService.dispatch(outboxRecord.id, payload).catch((err) => {
                    console.error('[PublicController] Notification dispatch failed:', err);
                });
            }
            // 6. Return standard envelope
            res.status(201).json({
                success: true,
                data: {
                    id: createdEnquiry.id,
                    reference_code: createdEnquiry.reference_code,
                    status: createdEnquiry.status,
                    created_at: createdEnquiry.created_at,
                },
                message: 'Your royal request has been received. Our concierge will contact you shortly.',
            });
        }
        catch (err) {
            next(err);
        }
    };
}
//# sourceMappingURL=publicController.js.map