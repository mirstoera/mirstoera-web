import { Request, Response, NextFunction } from 'express';
import { AdminRepository } from '@momera/database';
import { AdminUserEntity } from '@momera/shared';
declare global {
    namespace Express {
        interface Request {
            admin?: AdminUserEntity;
            sessionToken?: string;
        }
    }
}
export declare function hashSessionToken(token: string): string;
export declare function createAuthMiddleware(adminRepo: AdminRepository): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map