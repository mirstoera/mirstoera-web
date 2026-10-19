import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabaseAdapter } from '../adapters/index.js';
import { INITIAL_SCHEMA_SQL } from './initial_schema_sql.js';
export async function runMigrations(customDb) {
    const dbPath = process.env.DATABASE_PATH || './data/momera.sqlite';
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const db = customDb || createDatabaseAdapter(process.env.DATABASE_MODE || 'local', dbPath);
    try {
        // 1. Ensure _migrations table exists
        await db.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      );
    `);
        const migrationName = '0000_initial_schema';
        // 2. Check if already applied
        const applied = await db.queryOne('SELECT id FROM _migrations WHERE name = ?', [migrationName]);
        if (applied) {
            console.log(`[Migrations] '${migrationName}' is already applied.`);
            try {
                await db.execute('ALTER TABLE services ADD COLUMN cover_image_url TEXT');
            }
            catch {
                // column already exists
            }
            return;
        }
        console.log(`[Migrations] Applying '${migrationName}'...`);
        await db.transaction(async (tx) => {
            // Split statements by semicolon and run each
            const statements = INITIAL_SCHEMA_SQL
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
            for (const statement of statements) {
                await tx.execute(statement);
            }
            await tx.execute('INSERT INTO _migrations (name) VALUES (?)', [migrationName]);
        });
        console.log(`[Migrations] Successfully applied '${migrationName}'.`);
    }
    finally {
        if (!customDb) {
            db.close();
        }
    }
}
// Allow direct CLI execution
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('[Migrations] Failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=runner.js.map