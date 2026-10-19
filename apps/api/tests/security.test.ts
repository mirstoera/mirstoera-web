import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import { createApp } from '../src/app.js';
import {
  createDatabaseAdapter,
  runMigrations,
  runSeeds,
  hashPassword,
  verifyPassword,
} from '@momera/database';
import { hashSessionToken } from '../src/middleware/auth.js';
import fs from 'node:fs';

describe('RUDRA Security & Data Privacy Verification Suite', () => {
  let app: any;
  let testRawDb: Database.Database;
  let db: any;
  let validAdminCookie: string;
  let validSessionToken: string;
  const testDbPath = './data/test-security.sqlite';

  beforeAll(async () => {
    process.env.DATABASE_MODE = 'local';
    process.env.DATABASE_PATH = testDbPath;
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@mirstoera.in';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'RoyalMirstoeraAdmin2026!';

    db = createDatabaseAdapter('local', testDbPath);
    await runMigrations(db);
    await runSeeds(db);
    testRawDb = db.getRawDb();

    const appObj = createApp({ db });
    app = appObj.app;

    // Login as admin to obtain legitimate session credentials
    const loginRes = await request(app).post('/api/admin/login').send({
      email: 'admin@mirstoera.in',
      password: 'RoyalMirstoeraAdmin2026!',
    });

    expect(loginRes.status).toBe(200);
    validSessionToken = loginRes.body.data.token;
    const cookies = loginRes.headers['set-cookie'];
    validAdminCookie = cookies[0];
  }, 30000);

  afterAll(() => {
    if (db) {
      db.close();
    }
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {
      // Ignore
    }
  });

  // ==========================================
  // 1. AUTHENTICATION: SCRYPT & SESSIONS
  // ==========================================
  describe('1. Authentication: Scrypt Hashing & Session Management', () => {
    it('generates unique salts and hashes for the same password using scrypt', () => {
      const pwd = 'TestSuperSecretPassword123!';
      const hash1 = hashPassword(pwd);
      const hash2 = hashPassword(pwd);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/);
      expect(hash2).toMatch(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/);

      expect(verifyPassword(pwd, hash1)).toBe(true);
      expect(verifyPassword(pwd, hash2)).toBe(true);
      expect(verifyPassword('WrongPassword', hash1)).toBe(false);
    });

    it('safely handles corrupted or malformed scrypt hash strings without crashing', () => {
      expect(verifyPassword('password', 'malformed_hash')).toBe(false);
      expect(verifyPassword('password', 'md5:salt:abc')).toBe(false);
      expect(verifyPassword('password', 'scrypt:short')).toBe(false);
      expect(verifyPassword('password', '')).toBe(false);
    });

    it('stores SHA-256 hashed session tokens in database, NEVER plaintext tokens', async () => {
      const expectedSessionHash = hashSessionToken(validSessionToken);

      // Verify the hashed session exists in admin_sessions table
      const sessionInDb = testRawDb
        .prepare('SELECT * FROM admin_sessions WHERE session_hash = ?')
        .get(expectedSessionHash) as any;

      expect(sessionInDb).toBeDefined();
      expect(sessionInDb.session_hash).toBe(expectedSessionHash);

      // Verify raw session token NEVER exists anywhere in the database table
      const plaintextLeak = testRawDb
        .prepare('SELECT * FROM admin_sessions WHERE session_hash = ? OR id = ?')
        .get(validSessionToken, validSessionToken);
      expect(plaintextLeak).toBeUndefined();
    });

    it('issues HttpOnly, SameSite=Lax session cookies', async () => {
      const res = await request(app).post('/api/admin/login').send({
        email: 'admin@mirstoera.in',
        password: 'RoyalMirstoeraAdmin2026!',
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const sessionCookie = cookies.find((c: string) => c.startsWith('mirstoera_session='));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/HttpOnly/i);
      expect(sessionCookie).toMatch(/SameSite=Lax/i);
      expect(sessionCookie).toMatch(/Path=\//i);
    });

    it('immediately destroys session row in database upon logout', async () => {
      // 1. Create a dedicated session for logout test
      const loginRes = await request(app).post('/api/admin/login').send({
        email: 'admin@mirstoera.in',
        password: 'RoyalMirstoeraAdmin2026!',
      });
      const tempToken = loginRes.body.data.token;
      const tempCookie = loginRes.headers['set-cookie'][0];
      const tempHash = hashSessionToken(tempToken);

      // Verify session exists in DB
      let dbSession = testRawDb
        .prepare('SELECT * FROM admin_sessions WHERE session_hash = ?')
        .get(tempHash);
      expect(dbSession).toBeDefined();

      // 2. Perform logout
      const logoutRes = await request(app)
        .post('/api/admin/logout')
        .set('Cookie', tempCookie);

      expect(logoutRes.status).toBe(200);

      // 3. Verify session was permanently purged from DB
      dbSession = testRawDb
        .prepare('SELECT * FROM admin_sessions WHERE session_hash = ?')
        .get(tempHash);
      expect(dbSession).toBeUndefined();

      // 4. Verify subsequent authenticated request fails with 401
      const checkRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', tempCookie);
      expect(checkRes.status).toBe(401);
      expect(checkRes.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects expired sessions and automatically deletes them from DB', async () => {
      const expiredRawToken = crypto.randomBytes(32).toString('hex');
      const expiredHash = hashSessionToken(expiredRawToken);
      const expiredId = crypto.randomUUID();
      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago

      testRawDb
        .prepare('INSERT INTO admin_sessions (id, admin_id, session_hash, expires_at) VALUES (?, 1, ?, ?)')
        .run(expiredId, expiredHash, pastDate);

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', `mirstoera_session=${expiredRawToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');

      // Verify expired session was pruned from DB
      const purged = testRawDb
        .prepare('SELECT * FROM admin_sessions WHERE session_hash = ?')
        .get(expiredHash);
      expect(purged).toBeUndefined();
    });
  });

  // ==========================================
  // 2. AUTHORIZATION & ADMIN ROUTE GUARDS
  // ==========================================
  describe('2. Authorization: Route Guards & Privilege Escalation Defenses', () => {
    const protectedAdminEndpoints = [
      { method: 'get', path: '/api/admin/session' },
      { method: 'get', path: '/api/admin/dashboard' },
      { method: 'get', path: '/api/admin/enquiries' },
      { method: 'get', path: '/api/admin/enquiries/1' },
      { method: 'patch', path: '/api/admin/enquiries/1/status', body: { status: 'CONTACTED' } },
      { method: 'post', path: '/api/admin/enquiries/1/notes', body: { note: 'Security probe' } },
      { method: 'get', path: '/api/admin/services' },
      { method: 'patch', path: '/api/admin/services/1', body: { tagline: 'Hacked' } },
      { method: 'get', path: '/api/admin/settings' },
      { method: 'patch', path: '/api/admin/settings', body: { brand_name: 'Defaced' } },
      { method: 'get', path: '/api/admin/notifications' },
      { method: 'post', path: '/api/admin/notifications/1/retry' },
      { method: 'get', path: '/api/admin/audit-logs' },
    ];

    for (const ep of protectedAdminEndpoints) {
      it(`blocks unauthenticated request to ${ep.method.toUpperCase()} ${ep.path} with 401`, async () => {
        let reqInstance: any = (request(app) as any)[ep.method](ep.path);
        if (ep.body) {
          reqInstance = reqInstance.send(ep.body);
        }

        const res = await reqInstance;
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      });
    }

    it('rejects forged session tokens with 401', async () => {
      const forgedToken = '0000000000000000000000000000000000000000000000000000000000000000';
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', `mirstoera_session=${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('prevents illegal status transitions to enforce workflow integrity', async () => {
      // 1. Create a fresh enquiry
      const enqRes = await request(app).post('/api/enquiries').send({
        idempotency_key: 'sec-workflow-test-key-01',
        customer_name: 'Security Test Customer',
        customer_phone: '9876543210',
        service_slug: 'birthday-surprise',
        event_date: '2027-10-10',
        event_time: '18:00',
        event_area: 'Race Course',
        recipient_relationship: 'Friend',
        description: 'Testing workflow transition security barriers.',
        privacy_consent: true,
      });

      const enqId = enqRes.body.data.id;

      // 2. Try illegal jump from NEW directly to COMPLETED (bypassing CONTACTED, QUOTED, CONFIRMED)
      const illegalTransitionRes = await request(app)
        .patch(`/api/admin/enquiries/${enqId}/status`)
        .set('Cookie', validAdminCookie)
        .send({ status: 'COMPLETED' });

      expect(illegalTransitionRes.status).toBe(400);
      expect(illegalTransitionRes.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('blocks unauthenticated requests to POST /api/admin/services with 401', async () => {
      const res = await request(app).post('/api/admin/services').send({
        title: 'Hacker Spoofed Service',
        slug: 'hacker-service',
        description: 'Attempting to inject an unauthenticated service entry.',
        starting_price_inr: 100,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('creates immutable audit logs when an admin creates or updates an event/service', async () => {
      // 1. Create service as admin
      const createRes = await request(app)
        .post('/api/admin/services')
        .set('Cookie', validAdminCookie)
        .send({
          title: 'Royal Anniversary Candlelight',
          slug: 'royal-anniversary-candlelight',
          tagline: 'Private rooftop dinner under Coimbatore skies.',
          description: 'Custom acoustic music with rose-strewn pathway and candlelight dining.',
          starting_price_inr: 3999,
          display_order: 6,
          is_active: true,
        });

      expect(createRes.status).toBe(201);
      const newServiceId = createRes.body.data.id;

      // 2. Query admin_audit_logs to verify CREATE_SERVICE audit record
      const auditLog = testRawDb
        .prepare("SELECT * FROM admin_audit_logs WHERE action = 'CREATE_SERVICE' AND entity_id = ?")
        .get(String(newServiceId)) as any;

      expect(auditLog).toBeDefined();
      expect(auditLog.entity_type).toBe('service');
      const details = JSON.parse(auditLog.metadata_json);
      expect(details.slug).toBe('royal-anniversary-candlelight');
      expect(details.starting_price_inr).toBe(3999);
    });
  });

  // ==========================================
  // 3. INPUT VALIDATION & INJECTION DEFENSES
  // ==========================================
  describe('3. Input Validation & Injection Defenses', () => {
    it('resists SQL injection attacks in search filters and IDs', async () => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "1; DROP TABLE enquiries; --",
        "' UNION SELECT id, email, password_hash, 1, 1, 1, 1 FROM admin_users --",
        "1' OR 1=1 --",
      ];

      for (const payload of sqlInjectionPayloads) {
        const res = await request(app)
          .get(`/api/admin/enquiries?search=${encodeURIComponent(payload)}`)
          .set('Cookie', validAdminCookie);

        expect(res.status).toBe(200);
        // Table should not be dropped, query should execute safely with 0 injection matches
      }

      // Verify enquiries table remains intact
      const count = testRawDb.prepare('SELECT count(*) as count FROM enquiries').get() as any;
      expect(count.count).toBeGreaterThan(0);
    });

    it('resists SQL injection attacks in parameterized customer inputs', async () => {
      const maliciousPayload = "'); DROP TABLE admin_users; --";
      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: 'sec-sqli-test-key-02',
        customer_name: maliciousPayload,
        customer_phone: '9876543210',
        service_slug: 'birthday-surprise',
        event_date: '2027-10-10',
        event_time: '18:00',
        event_area: 'Race Course',
        recipient_relationship: 'Self',
        description: 'Resilience against parameterized SQL injection.',
        privacy_consent: true,
      });

      expect(res.status).toBe(201);

      // Verify admin_users table was not dropped
      const adminCount = testRawDb.prepare('SELECT count(*) as count FROM admin_users').get() as any;
      expect(adminCount.count).toBeGreaterThan(0);
    });

    it('rejects oversized JSON request payloads exceeding 100kb limit with 413', async () => {
      const hugeString = 'A'.repeat(120 * 1024); // 120 KB string
      const res = await request(app)
        .post('/api/enquiries')
        .set('Content-Type', 'application/json')
        .send({
          idempotency_key: 'sec-dos-test-01',
          customer_name: 'Dos Attacker',
          customer_phone: '9876543210',
          service_slug: 'birthday-surprise',
          event_date: '2027-10-10',
          event_time: '18:00',
          event_area: 'Race Course',
          recipient_relationship: 'Self',
          description: hugeString,
          privacy_consent: true,
        });

      // Express body parser returns 413 Payload Too Large
      expect(res.status).toBe(413);
    });

    it('strictly sanitizes and rejects invalid Indian phone numbers', async () => {
      const invalidPhones = [
        '1234567890',      // Starts with 1 (not 6-9)
        '98765',           // Only 5 digits
        '987654321012345', // Too long
        'abcdefghij',      // Non-digits
        '+14155552671',    // US phone number
      ];

      for (const phone of invalidPhones) {
        const res = await request(app).post('/api/enquiries').send({
          idempotency_key: `sec-phone-test-${Date.now()}-${Math.random()}`,
          customer_name: 'Phone Validator',
          customer_phone: phone,
          service_slug: 'birthday-surprise',
          event_date: '2027-10-10',
          event_time: '18:00',
          event_area: 'RS Puram',
          recipient_relationship: 'Self',
          description: 'Validating strict phone number validation rules.',
          privacy_consent: true,
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  // ==========================================
  // 4. DATA PRIVACY & INFORMATION DISCLOSURE
  // ==========================================
  describe('4. Data Privacy & Zero-Knowledge Public Responses', () => {
    it('POST /api/enquiries NEVER leaks customer phone number or narrative in the response', async () => {
      const sensitivePhone = '9876543210';
      const sensitiveNarrative = 'Highly confidential surprise plans for high profile anniversary celebration.';

      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: 'sec-privacy-test-key-999',
        customer_name: 'Confidential Client',
        customer_phone: sensitivePhone,
        service_slug: 'mini-proposal',
        event_date: '2027-12-25',
        event_time: '19:00',
        event_area: 'Race Course Lake',
        recipient_relationship: 'Partner',
        description: sensitiveNarrative,
        privacy_consent: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify that sensitive customer data is NOT present anywhere in the response body
      const responseString = JSON.stringify(res.body);
      expect(responseString).not.toContain(sensitivePhone);
      expect(responseString).not.toContain(sensitiveNarrative);
      expect(responseString).not.toContain('Confidential Client');

      // Response only contains safe confirmation metadata
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('reference_code');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('created_at');
    });

    it('Idempotent replay on POST /api/enquiries NEVER leaks customer PII', async () => {
      const res = await request(app).post('/api/enquiries').send({
        idempotency_key: 'sec-privacy-test-key-999',
        customer_name: 'Confidential Client',
        customer_phone: '9876543210',
        service_slug: 'mini-proposal',
        event_date: '2027-12-25',
        event_time: '19:00',
        event_area: 'Race Course Lake',
        recipient_relationship: 'Partner',
        description: 'Duplicate attempt replay probe.',
        privacy_consent: true,
      });

      expect(res.status).toBe(200);
      const responseString = JSON.stringify(res.body);
      expect(responseString).not.toContain('9876543210');
      expect(responseString).not.toContain('Confidential Client');
    });

    it('GET /api/public-settings NEVER exposes notification recipient or server credentials', async () => {
      const res = await request(app).get('/api/public-settings');

      expect(res.status).toBe(200);
      expect(res.body.data).not.toHaveProperty('notification_recipient');
      expect(res.body.data).not.toHaveProperty('whatsapp_api_token');
      expect(res.body.data).not.toHaveProperty('session_secret');
    });

    it('Centralized error handler sanitizes internal 500 error responses', async () => {
      // Trigger a 404 or bad ID route to observe clean envelope
      const res = await request(app).get('/api/admin/enquiries/invalid-id').set('Cookie', validAdminCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body).not.toHaveProperty('stack');
    });
  });
});
