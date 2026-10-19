import crypto from 'node:crypto';
import { verifyPassword, } from '@momera/database';
import { adminLoginSchema, adminStatusUpdateSchema, adminNoteCreateSchema, serviceCreateSchema, serviceUpdateSchema, businessSettingsUpdateSchema, VALID_STATUS_TRANSITIONS, } from '@momera/shared';
import { config } from '../config/index.js';
import { hashSessionToken } from '../middleware/auth.js';
import { buildWhatsAppChatUrl } from '../notifications/provider.js';
export class AdminController {
    adminRepo;
    enquiryRepo;
    enquiryNoteRepo;
    serviceRepo;
    settingsRepo;
    notificationRepo;
    auditRepo;
    notificationService;
    constructor(adminRepo, enquiryRepo, enquiryNoteRepo, serviceRepo, settingsRepo, notificationRepo, auditRepo, notificationService) {
        this.adminRepo = adminRepo;
        this.enquiryRepo = enquiryRepo;
        this.enquiryNoteRepo = enquiryNoteRepo;
        this.serviceRepo = serviceRepo;
        this.settingsRepo = settingsRepo;
        this.notificationRepo = notificationRepo;
        this.auditRepo = auditRepo;
        this.notificationService = notificationService;
    }
    login = async (req, res, next) => {
        try {
            const { email, password } = adminLoginSchema.parse(req.body);
            const adminUser = await this.adminRepo.findByEmail(email);
            if (!adminUser || !adminUser.is_active) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid administrative email or password.',
                    },
                });
                return;
            }
            const isValid = verifyPassword(password, adminUser.password_hash);
            if (!isValid) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid administrative email or password.',
                    },
                });
                return;
            }
            // Generate secure 32-byte random session token
            const rawSessionToken = crypto.randomBytes(32).toString('hex');
            const sessionHash = hashSessionToken(rawSessionToken);
            const sessionId = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + config.sessionTtlHours * 3600 * 1000).toISOString();
            await this.adminRepo.createSession(sessionId, adminUser.id, sessionHash, expiresAt);
            // Set HttpOnly, SameSite, conditional Secure cookie
            const cookieOpts = {
                httpOnly: true,
                secure: config.isProduction,
                sameSite: 'lax',
                maxAge: config.sessionTtlHours * 3600 * 1000,
                path: '/',
            };
            res.cookie('mirstoera_session', rawSessionToken, cookieOpts);
            res.cookie('momera_session', rawSessionToken, cookieOpts);
            await this.auditRepo.log('ADMIN_LOGIN', 'admin_user', String(adminUser.id), adminUser.id, {
                ip: req.ip,
            });
            res.json({
                success: true,
                data: {
                    user: {
                        id: adminUser.id,
                        email: adminUser.email,
                        full_name: adminUser.full_name,
                    },
                    token: rawSessionToken, // Also return in body for programmatic test clients
                },
                message: 'Administrative authentication successful',
            });
        }
        catch (err) {
            next(err);
        }
    };
    logout = async (req, res, next) => {
        try {
            const rawToken = req.sessionToken ||
                req.cookies?.mirstoera_session ||
                req.cookies?.momera_session ||
                (req.headers.authorization?.startsWith('Bearer ')
                    ? req.headers.authorization.substring(7)
                    : undefined);
            if (rawToken) {
                const sessionHash = hashSessionToken(rawToken);
                await this.adminRepo.deleteSession(sessionHash);
            }
            res.clearCookie('mirstoera_session', { path: '/' });
            res.clearCookie('momera_session', { path: '/' });
            if (req.admin) {
                await this.auditRepo.log('ADMIN_LOGOUT', 'admin_user', String(req.admin.id), req.admin.id);
            }
            res.json({
                success: true,
                data: null,
                message: 'Logged out successfully',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getSession = async (req, res) => {
        res.json({
            success: true,
            data: {
                user: req.admin,
            },
            message: 'Active session verified',
        });
    };
    getDashboard = async (_req, res, next) => {
        try {
            const metrics = await this.adminRepo.getDashboardMetrics();
            const recentEnquiries = await this.enquiryRepo.list({ limit: 5 });
            res.json({
                success: true,
                data: {
                    metrics,
                    recent_enquiries: recentEnquiries.items,
                },
                message: 'Dashboard metrics calculated',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getEnquiries = async (req, res, next) => {
        try {
            const status = req.query.status;
            const serviceSlug = req.query.service_slug;
            const search = req.query.search;
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
            const offset = (page - 1) * limit;
            const result = await this.enquiryRepo.list({
                status,
                service_slug: serviceSlug,
                search,
                limit,
                offset,
            });
            res.json({
                success: true,
                data: {
                    items: result.items,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        total_pages: Math.ceil(result.total / limit),
                    },
                },
                message: 'Enquiries retrieved',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getEnquiryById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_ID', message: 'Invalid enquiry ID' },
                });
                return;
            }
            const enquiry = await this.enquiryRepo.getById(id);
            if (!enquiry) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
                });
                return;
            }
            const notes = await this.enquiryNoteRepo.getNotesByEnquiry(id);
            // Generate pre-encoded WhatsApp link
            const whatsappGreeting = `Hello ${enquiry.customer_name}! This is MIRSTOERA Concierge. We received your request (${enquiry.reference_code}) for ${enquiry.service_title || 'a Royal Moment'} on ${enquiry.event_date}. We would love to discuss your plans!`;
            const whatsappUrl = buildWhatsAppChatUrl(enquiry.customer_phone, whatsappGreeting);
            res.json({
                success: true,
                data: {
                    enquiry,
                    notes,
                    whatsapp_url: whatsappUrl,
                },
                message: 'Enquiry details loaded',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateEnquiryStatus = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const validated = adminStatusUpdateSchema.parse(req.body);
            const enquiry = await this.enquiryRepo.getById(id);
            if (!enquiry) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
                });
                return;
            }
            // Check transition validity
            const allowedTransitions = VALID_STATUS_TRANSITIONS[enquiry.status];
            if (enquiry.status !== validated.status && !allowedTransitions.includes(validated.status)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS_TRANSITION',
                        message: `Cannot transition enquiry status from ${enquiry.status} to ${validated.status}. Allowed: ${allowedTransitions.join(', ') || 'None'}`,
                    },
                });
                return;
            }
            const quotedPaise = validated.quoted_price_inr
                ? validated.quoted_price_inr * 100
                : validated.quoted_price_paise;
            const updated = await this.enquiryRepo.updateStatus(id, validated.status, quotedPaise);
            // Append internal note if provided
            if (validated.note) {
                await this.enquiryNoteRepo.addNote(id, req.admin.id, validated.note);
            }
            await this.auditRepo.log('UPDATE_STATUS', 'enquiry', String(id), req.admin.id, {
                previous_status: enquiry.status,
                new_status: validated.status,
                quoted_price_paise: quotedPaise,
            });
            res.json({
                success: true,
                data: updated,
                message: `Enquiry status updated to ${validated.status}`,
            });
        }
        catch (err) {
            next(err);
        }
    };
    addEnquiryNote = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const { note } = adminNoteCreateSchema.parse(req.body);
            const enquiry = await this.enquiryRepo.getById(id);
            if (!enquiry) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Enquiry not found' },
                });
                return;
            }
            const createdNote = await this.enquiryNoteRepo.addNote(id, req.admin.id, note);
            await this.auditRepo.log('ADD_NOTE', 'enquiry', String(id), req.admin.id, {
                note_id: createdNote.id,
            });
            res.status(201).json({
                success: true,
                data: createdNote,
                message: 'Internal note saved',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getServices = async (_req, res, next) => {
        try {
            const allServices = await this.serviceRepo.getAll();
            res.json({
                success: true,
                data: allServices,
                message: 'All services loaded',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateService = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const validated = serviceUpdateSchema.parse(req.body);
            const payload = { ...validated };
            if (validated.starting_price_inr !== undefined) {
                payload.starting_price_paise = validated.starting_price_inr * 100;
                delete payload.starting_price_inr;
            }
            const updated = await this.serviceRepo.update(id, payload);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Service not found' },
                });
                return;
            }
            await this.auditRepo.log('UPDATE_SERVICE', 'service', String(id), req.admin.id, payload);
            res.json({
                success: true,
                data: updated,
                message: 'Service updated successfully',
            });
        }
        catch (err) {
            next(err);
        }
    };
    createService = async (req, res, next) => {
        try {
            const validated = serviceCreateSchema.parse(req.body);
            // Check for duplicate slug
            const existing = await this.serviceRepo.getBySlug(validated.slug);
            if (existing) {
                res.status(409).json({
                    success: false,
                    error: { code: 'DUPLICATE_SLUG', message: `A service with slug "${validated.slug}" already exists` },
                });
                return;
            }
            const created = await this.serviceRepo.create({
                slug: validated.slug,
                title: validated.title,
                tagline: validated.tagline,
                description: validated.description,
                starting_price_paise: validated.starting_price_inr * 100,
                cover_image_url: validated.cover_image_url || null,
                is_active: validated.is_active,
                display_order: validated.display_order,
            });
            await this.auditRepo.log('CREATE_SERVICE', 'service', String(created.id), req.admin.id, {
                slug: created.slug,
                title: created.title,
                starting_price_inr: validated.starting_price_inr,
            });
            res.status(201).json({
                success: true,
                data: created,
                message: 'New royal experience created successfully',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getSettings = async (_req, res, next) => {
        try {
            const settings = await this.settingsRepo.getAdminSettings();
            res.json({
                success: true,
                data: settings,
                message: 'Settings loaded',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateSettings = async (req, res, next) => {
        try {
            const validated = businessSettingsUpdateSchema.parse(req.body);
            const cleanEntries = {};
            for (const [k, v] of Object.entries(validated)) {
                if (v !== undefined) {
                    cleanEntries[k] = v === null ? '' : String(v);
                }
            }
            await this.settingsRepo.updateSettings(cleanEntries);
            await this.auditRepo.log('UPDATE_SETTINGS', 'business_settings', 'all', req.admin.id, validated);
            const updated = await this.settingsRepo.getAdminSettings();
            res.json({
                success: true,
                data: updated,
                message: 'Settings updated successfully',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getNotifications = async (_req, res, next) => {
        try {
            const items = await this.notificationRepo.getAll(50);
            res.json({
                success: true,
                data: items,
                message: 'Notification outbox records loaded',
            });
        }
        catch (err) {
            next(err);
        }
    };
    retryNotification = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const success = await this.notificationService.retry(id);
            await this.auditRepo.log('RETRY_NOTIFICATION', 'notification_outbox', String(id), req.admin.id, {
                success,
            });
            res.json({
                success,
                data: { id, success },
                message: success ? 'Notification resent successfully' : 'Notification retry failed',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getAuditLogs = async (_req, res, next) => {
        try {
            const logs = await this.auditRepo.getLogs(100);
            res.json({
                success: true,
                data: logs,
                message: 'Audit logs retrieved',
            });
        }
        catch (err) {
            next(err);
        }
    };
}
//# sourceMappingURL=adminController.js.map