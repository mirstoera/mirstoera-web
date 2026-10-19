import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createDatabaseAdapter } from '../adapters/index.js';
import { OFFICIAL_SERVICES, BRAND_CONSTANTS } from '@momera/shared';
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
}
export function verifyPassword(password, storedHash) {
    try {
        const parts = storedHash.split(':');
        if (parts.length !== 3 || parts[0] !== 'scrypt') {
            return false;
        }
        const [, salt, originalHash] = parts;
        const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
    }
    catch {
        return false;
    }
}
export async function runSeeds(customDb) {
    const db = customDb || createDatabaseAdapter();
    try {
        console.log('[Seeds] Seeding canonical services...');
        for (const service of Object.values(OFFICIAL_SERVICES)) {
            const existing = await db.queryOne('SELECT id FROM services WHERE slug = ?', [service.slug]);
            if (!existing) {
                await db.execute(`INSERT INTO services (slug, title, tagline, description, starting_price_paise, is_active, display_order)
           VALUES (?, ?, ?, ?, ?, 1, ?)`, [
                    service.slug,
                    service.title,
                    service.tagline,
                    service.description,
                    service.starting_price_paise,
                    service.display_order,
                ]);
                console.log(`[Seeds] Inserted service: ${service.title}`);
            }
        }
        console.log('[Seeds] Seeding business settings...');
        const defaultSettings = {
            brand_name: BRAND_CONSTANTS.NAME,
            tagline: BRAND_CONSTANTS.TAGLINE,
            phone: process.env.BUSINESS_PHONE || BRAND_CONSTANTS.DEFAULT_PHONE,
            whatsapp: process.env.WHATSAPP_CONTACT_NUMBER || BRAND_CONSTANTS.DEFAULT_WHATSAPP,
            notification_recipient: process.env.NOTIFICATION_RECIPIENT_NUMBER || BRAND_CONSTANTS.DEFAULT_PHONE,
            email: process.env.BUSINESS_EMAIL || BRAND_CONSTANTS.DEFAULT_EMAIL,
            service_coverage: BRAND_CONSTANTS.LOCATION,
            business_hours: BRAND_CONSTANTS.DEFAULT_BUSINESS_HOURS,
        };
        for (const [key, value] of Object.entries(defaultSettings)) {
            const existing = await db.queryOne('SELECT id FROM business_settings WHERE setting_key = ?', [key]);
            if (!existing) {
                await db.execute('INSERT INTO business_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
            }
        }
        console.log('[Seeds] Checking bootstrap admin users...');
        const adminAccounts = [
            {
                email: process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@mirstoera.in',
                password: process.env.ADMIN_BOOTSTRAP_PASSWORD || 'RoyalMirstoeraAdmin2026!',
            },
            {
                email: 'admin@momera.in',
                password: 'RoyalMomeraAdmin2026!',
            },
        ];
        for (const acc of adminAccounts) {
            const existing = await db.queryOne('SELECT id FROM admin_users WHERE email = ?', [acc.email]);
            if (!existing) {
                const hash = hashPassword(acc.password);
                await db.execute(`INSERT INTO admin_users (email, password_hash, full_name, is_active)
           VALUES (?, ?, 'Royal Concierge Admin', 1)`, [acc.email, hash]);
                console.log(`[Seeds] Created bootstrap admin user: ${acc.email}`);
            }
            else {
                console.log(`[Seeds] Admin user '${acc.email}' already exists.`);
            }
        }
        console.log('[Seeds] Seeding completed successfully.');
    }
    finally {
        if (!customDb) {
            db.close();
        }
    }
}
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    runSeeds()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('[Seeds] Failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=runner.js.map