import { ZodError } from 'zod';
export function errorHandler(err, _req, res, _next) {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.errors[0]?.message || 'Please check the submitted details.',
                details: formattedErrors,
            },
        });
        return;
    }
    // Handle generic operational or HTTP errors
    const status = typeof err.status === 'number' ? err.status : 500;
    const message = status === 500
        ? 'An unexpected error occurred. Please try again or contact concierge.'
        : err.message || 'Operation failed';
    const code = err.code || (status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    res.status(status).json({
        success: false,
        error: {
            code,
            message,
        },
    });
}
export function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource does not exist.',
        },
    });
}
//# sourceMappingURL=error.js.map