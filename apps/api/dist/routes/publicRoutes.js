import { Router } from 'express';
import { enquiryRateLimiter } from '../middleware/rateLimit.js';
export function createPublicRoutes(controller) {
    const router = Router();
    router.get('/health', controller.getHealth);
    router.get('/services', controller.getServices);
    router.get('/services/:slug', controller.getServiceBySlug);
    router.post('/enquiries', enquiryRateLimiter, controller.submitEnquiry);
    router.get('/public-settings', controller.getPublicSettings);
    return router;
}
//# sourceMappingURL=publicRoutes.js.map