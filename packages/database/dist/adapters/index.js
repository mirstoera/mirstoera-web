import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
export class BetterSqlite3Adapter {
    db;
    constructor(dbPath) {
        if (typeof dbPath === 'string') {
            const dir = path.dirname(dbPath);
            if (dir && !fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            this.db = new Database(dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('busy_timeout = 5000');
        }
        else {
            this.db = dbPath;
        }
    }
    getRawDb() {
        return this.db;
    }
    async query(sqlStr, params = []) {
        const stmt = this.db.prepare(sqlStr);
        return stmt.all(...params);
    }
    async queryOne(sqlStr, params = []) {
        const stmt = this.db.prepare(sqlStr);
        const row = stmt.get(...params);
        return row ?? null;
    }
    async execute(sqlStr, params = []) {
        const stmt = this.db.prepare(sqlStr);
        const info = stmt.run(...params);
        return {
            rowsAffected: info.changes,
            lastInsertRowId: info.lastInsertRowid,
        };
    }
    async transaction(fn) {
        // BetterSqlite3 supports synchronous transaction wrapper
        // Because fn is async, we execute BEGIN/COMMIT/ROLLBACK explicitly to guarantee isolation
        this.db.exec('BEGIN IMMEDIATE');
        try {
            const result = await fn(this);
            this.db.exec('COMMIT');
            return result;
        }
        catch (err) {
            try {
                this.db.exec('ROLLBACK');
            }
            catch (rollbackErr) {
                // Rollback failed, possibly connection closed
            }
            throw err;
        }
    }
    close() {
        if (this.db && this.db.open) {
            this.db.close();
        }
    }
}
/**
 * Cloudflare D1 Database Adapter for Profile B (Commercial Edge Target)
 */
export class D1Adapter {
    d1;
    constructor(d1Binding) {
        this.d1 = d1Binding;
    }
    async query(sqlStr, params = []) {
        const stmt = this.d1.prepare(sqlStr).bind(...params);
        const result = await stmt.all();
        return (result.results ?? []);
    }
    async queryOne(sqlStr, params = []) {
        const stmt = this.d1.prepare(sqlStr).bind(...params);
        const row = await stmt.first();
        return row ?? null;
    }
    async execute(sqlStr, params = []) {
        const stmt = this.d1.prepare(sqlStr).bind(...params);
        const result = await stmt.run();
        return {
            rowsAffected: result.meta?.changes ?? 0,
            lastInsertRowId: result.meta?.last_row_id,
        };
    }
    async transaction(fn) {
        // D1 batch execution or simulated transaction boundary
        return await fn(this);
    }
    close() {
        // D1 bindings are managed by Cloudflare runtime
    }
}
export function createDatabaseAdapter(mode = process.env.DATABASE_MODE || 'local', dbPath = process.env.DATABASE_PATH || './data/momera.sqlite', d1Binding) {
    if (mode === 'd1' && d1Binding) {
        return new D1Adapter(d1Binding);
    }
    return new BetterSqlite3Adapter(dbPath);
}
//# sourceMappingURL=index.js.map