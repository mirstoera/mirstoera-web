import Database from 'better-sqlite3';
export interface RunResult {
    rowsAffected: number;
    lastInsertRowId?: number | bigint;
}
export interface DatabaseExecutor {
    query<T = any>(sqlStr: string, params?: unknown[]): Promise<T[]>;
    queryOne<T = any>(sqlStr: string, params?: unknown[]): Promise<T | null>;
    execute(sqlStr: string, params?: unknown[]): Promise<RunResult>;
    transaction<T>(fn: (tx: DatabaseExecutor) => Promise<T>): Promise<T>;
    close(): void;
}
export declare class BetterSqlite3Adapter implements DatabaseExecutor {
    private db;
    constructor(dbPath: string | Database.Database);
    getRawDb(): Database.Database;
    query<T = any>(sqlStr: string, params?: unknown[]): Promise<T[]>;
    queryOne<T = any>(sqlStr: string, params?: unknown[]): Promise<T | null>;
    execute(sqlStr: string, params?: unknown[]): Promise<RunResult>;
    transaction<T>(fn: (tx: DatabaseExecutor) => Promise<T>): Promise<T>;
    close(): void;
}
/**
 * Cloudflare D1 Database Adapter for Profile B (Commercial Edge Target)
 */
export declare class D1Adapter implements DatabaseExecutor {
    private d1;
    constructor(d1Binding: any);
    query<T = any>(sqlStr: string, params?: unknown[]): Promise<T[]>;
    queryOne<T = any>(sqlStr: string, params?: unknown[]): Promise<T | null>;
    execute(sqlStr: string, params?: unknown[]): Promise<RunResult>;
    transaction<T>(fn: (tx: DatabaseExecutor) => Promise<T>): Promise<T>;
    close(): void;
}
export declare function createDatabaseAdapter(mode?: string, dbPath?: string, d1Binding?: any): DatabaseExecutor;
//# sourceMappingURL=index.d.ts.map