import crypto from 'node:crypto';
export function hashSessionToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function createAuthMiddleware(adminRepo) {
    return async (req, res, next) => {
        try {
            // 1. Extract session token from cookie or Authorization header
            const cookieToken = req.cookies?.mirstoera_session || req.cookies?.momera_session;
            const authHeader = req.headers.authorization;
            const bearerToken = authHeader?.startsWith('Bearer ')
                ? authHeader.substring(7)
                : undefined;
            const rawToken = cookieToken || bearerToken;
            if (!rawToken) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Administrative authentication is required to access this resource.',
                    },
                });
                return;
            }
            // 2. Hash session token and find session
            const sessionHash = hashSessionToken(rawToken);
            const session = await adminRepo.findSession(sessionHash);
            if (!session) {
                res.clearCookie('mirstoera_session');
                res.clearCookie('momera_session');
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid or expired administrative session.',
                    },
                });
                return;
            }
            // 3. Attach admin and continue
            req.admin = session.admin;
            req.sessionToken = rawToken;
            next();
        }
        catch (err) {
            console.error('[AuthMiddleware] Error verifying session:', err);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An error occurred while verifying your session.',
                },
            });
        }
    };
}
//# sourceMappingURL=auth.js.map