import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { DatabaseExecutor, createDatabaseAdapter, runMigrations, runSeeds } from '@momera/database';
import fs from 'node:fs';
import path from 'node:url';

describe('MOMÉRA Backend API Suite', () => {
  let app: any;
  let db: DatabaseExecutor;
  let adminCookie: string;
  let createdEnquiryId: number;
  let testIdempotencyKey: string;

  beforeAll(async () => {
    // Ensure test environment uses local db
    process.env.DATABASE_MODE = 'local';
    process.env.DATABASE_PATH = './data/test-momera.sqlite';
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@mirstoera.in';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'RoyalMirstoeraAdmin2026!';

    db = createDatabaseAdapter('local', './data/test-momera.sqlite');
    await runMigrations(db);
    await runSeeds(db);

    const appInstance = createApp({ db });
    app = appInstance.app;
  }, 30000);

  afterAll(() => {
    if (db) {
      db.close();
    }
    try {
      if (fs.existsSync('./data/test-momera.sqlite')) {
        fs.unlinkSync('./data/test-momera.sqlite');
      }
    } catch {
      // Ignore
    }
  });

  describe('Public Endpoints', () => {
    it('GET /api/health should return 200 with healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('GET /api/services should return all 4 canonical experiences', async () => {
      const res = await request(app).get('/api/services');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(4);

      const slugs = res.body.data.map((s: any) => s.slug);
      expect(slugs).toContain('secret-gift');
      expect(slugs).toContain('mini-proposal');
      expect(slugs).toContain('birthday-surprise');
      expect(slugs).toContain('hero-entry');
    });

    it('GET /api/services/:slug returns detailed single service', async () => {
      const res = await request(app).get('/api/services/mini-proposal');
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('mini-proposal');
      expect(res.body.data.starting_price_inr).toBe(1499);
    });

    it('GET /api/services/:slug returns 404 for invalid slug', async () => {
      const res = await request(app).get('/api/services/non-existent-luxury');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('POST /api/enquiries validates required fields', async () => {
      const res = await request(app).post('/api/enquiries').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/enquiries rejects past event dates', async () => {
      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: 'test-past-date-1',
        customer_name: 'Priya Raman',
        customer_phone: '9876543210',
        service_slug: 'birthday-surprise',
        event_date: '2020-01-01',
        event_time: '18:00',
        event_area: 'RS Puram',
        recipient_relationship: 'Best Friend',
        description: 'Past date testing',
        privacy_consent: true,
      });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/past/i);
    });

    it('POST /api/enquiries creates a real enquiry and outbox record', async () => {
      testIdempotencyKey = 'unique-key-' + Date.now();
      const futureDate = '2027-02-14';

      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: testIdempotencyKey,
        customer_name: 'Aravind Swaminathan',
        customer_phone: '9876543210',
        service_slug: 'mini-proposal',
        event_date: futureDate,
        event_time: '19:00',
        event_area: 'Race Course, Coimbatore',
        recipient_relationship: 'Partner/Spouse',
        description: 'Proposing during sunset walk with violin music and 3 red roses.',
        budget_inr: 2500,
        additional_preferences: 'Prefers red roses over white.',
        privacy_consent: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_code).toMatch(/^MIR-\d{6}$/);
      expect(res.body.data.status).toBe('NEW');

      createdEnquiryId = res.body.data.id;
    });

    it('POST /api/enquiries handles duplicate submissions idempotently', async () => {
      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: testIdempotencyKey,
        customer_name: 'Aravind Swaminathan',
        customer_phone: '9876543210',
        service_slug: 'mini-proposal',
        event_date: '2027-02-14',
        event_time: '19:00',
        event_area: 'Race Course, Coimbatore',
        recipient_relationship: 'Partner/Spouse',
        description: 'Proposing during sunset walk with violin music and 3 red roses.',
        privacy_consent: true,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdEnquiryId);
    });

    it('POST /api/enquiries accepts submission when optional budget is omitted or null', async () => {
      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: 'test-optional-budget-key-888',
        customer_name: 'Pooja Sundaram',
        customer_phone: '+91 94433 22110',
        service_slug: 'birthday-surprise',
        event_date: '2027-05-20',
        event_time: '20:00',
        event_area: 'Saibaba Colony',
        recipient_relationship: 'Mother',
        description: 'Organizing a serene 50th birthday dinner with acoustic violin and warm fairy lights.',
        privacy_consent: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_code).toMatch(/^MIR-\d{6}$/);
    });
  });

  describe('Admin Endpoints & Authentication', () => {
    it('blocks unauthenticated requests to /api/admin/dashboard with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid admin login credentials', async () => {
      const res = await request(app).post('/api/admin/login').send({
        email: 'admin@mirstoera.in',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('logs in successfully with valid admin credentials', async () => {
      const res = await request(app).post('/api/admin/login').send({
        email: 'admin@mirstoera.in',
        password: 'RoyalMirstoeraAdmin2026!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@mirstoera.in');

      // Capture session cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      adminCookie = cookies[0];
      expect(adminCookie).toMatch(/mirstoera_session=/);
    });

    it('GET /api/admin/dashboard returns accurate metrics computed from DB', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.metrics.new).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/admin/enquiries lists enquiries with search and filters', async () => {
      const res = await request(app)
        .get('/api/admin/enquiries?status=NEW&search=Aravind')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].customer_name).toBe('Aravind Swaminathan');
    });

    it('GET /api/admin/enquiries/:id returns full enquiry, notes, and pre-generated WhatsApp URL', async () => {
      const res = await request(app)
        .get(`/api/admin/enquiries/${createdEnquiryId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.enquiry.id).toBe(createdEnquiryId);
      expect(res.body.data.whatsapp_url).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
    });

    it('PATCH /api/admin/enquiries/:id/status updates status to CONTACTED', async () => {
      const res = await request(app)
        .patch(`/api/admin/enquiries/${createdEnquiryId}/status`)
        .set('Cookie', adminCookie)
        .send({
          status: 'CONTACTED',
          note: 'Called customer, confirmed sunset timing.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONTACTED');
    });

    it('rejects invalid status transitions (e.g. CONTACTED -> COMPLETED without QUOTED/CONFIRMED)', async () => {
      const res = await request(app)
        .patch(`/api/admin/enquiries/${createdEnquiryId}/status`)
        .set('Cookie', adminCookie)
        .send({
          status: 'COMPLETED',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('POST /api/admin/enquiries/:id/notes appends internal admin notes', async () => {
      const res = await request(app)
        .post(`/api/admin/enquiries/${createdEnquiryId}/notes`)
        .set('Cookie', adminCookie)
        .send({
          note: 'Customer requested acoustic violin player confirmation.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.note).toBe('Customer requested acoustic violin player confirmation.');
    });

    it('POST /api/admin/services creates a new royal experience event', async () => {
      const res = await request(app)
        .post('/api/admin/services')
        .set('Cookie', adminCookie)
        .send({
          title: 'Royal Starlight Proposal',
          slug: 'royal-starlight-proposal',
          tagline: 'Underneath the Coimbatore stars.',
          description: 'A bespoke candlelit terrace proposal with live violin accompaniment and custom fairy lights.',
          starting_price_inr: 2499,
          display_order: 5,
          is_active: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('royal-starlight-proposal');
      expect(res.body.data.starting_price_inr).toBe(2499);
      expect(res.body.data.starting_price_paise).toBe(249900);
    });

    it('POST /api/admin/services rejects duplicate slug with 409', async () => {
      const res = await request(app)
        .post('/api/admin/services')
        .set('Cookie', adminCookie)
        .send({
          title: 'Duplicate Starlight Proposal',
          slug: 'royal-starlight-proposal',
          description: 'Attempting to create another service with duplicate slug identifier.',
          starting_price_inr: 2999,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_SLUG');
    });

    it('PATCH /api/admin/services/:id updates service pricing and details', async () => {
      const res = await request(app)
        .patch('/api/admin/services/1')
        .set('Cookie', adminCookie)
        .send({
          starting_price_inr: 899,
          tagline: 'An unexpected royal surprise at your doorstep.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.starting_price_inr).toBe(899);
      expect(res.body.data.starting_price_paise).toBe(89900);
    });

    it('GET /api/admin/notifications retrieves outbox records', async () => {
      const res = await request(app)
        .get('/api/admin/notifications')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/admin/logout clears session', async () => {
      const res = await request(app)
        .post('/api/admin/logout')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);

      // Verify that old cookie is now rejected
      const checkRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', adminCookie);

      expect(checkRes.status).toBe(401);
    });
  });
});
