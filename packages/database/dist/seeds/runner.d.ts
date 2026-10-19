import { DatabaseExecutor } from '../adapters/index.js';
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, storedHash: string): boolean;
export declare function runSeeds(customDb?: DatabaseExecutor): Promise<void>;
//# sourceMappingURL=runner.d.ts.map