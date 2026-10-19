import rateLimit from 'express-rate-limit';
export const enquiryRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 15 enquiries per window
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many enquiries submitted from this network. Please wait a few minutes before submitting again.',
        },
    },
});
export const adminLoginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Too many login attempts. Please wait 15 minutes before trying again.',
        },
    },
});
//# sourceMappingURL=rateLimit.js.map