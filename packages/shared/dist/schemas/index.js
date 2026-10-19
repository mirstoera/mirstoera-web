import { z } from 'zod';
import { ENQUIRY_STATUSES } from '../constants/index.js';
/**
 * Normalizes Indian phone numbers to 10 digits.
 * Accepts formats: +919876543210, 919876543210, 09876543210, 9876543210, with optional spaces/dashes.
 */
export function normalizeIndianPhone(phoneStr) {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
        return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
        return digits.slice(1);
    }
    return digits;
}
export const phoneSchema = z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(16, 'Phone number is too long')
    .transform(normalizeIndianPhone)
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: 'Please provide a valid 10-digit Indian mobile number (e.g., 9876543210)',
});
/**
 * Checks that date is not in the past.
 * Uses YYYY-MM-DD string comparison with current date.
 */
export const eventDateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .refine((dateStr) => {
    const target = new Date(`${dateStr}T00:00:00Z`);
    if (isNaN(target.getTime()))
        return false;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return target >= today;
}, {
    message: 'Event date cannot be in the past.',
});
export const enquirySubmissionSchema = z.object({
    idempotency_key: z
        .string()
        .min(8, 'Invalid idempotency key')
        .max(64, 'Idempotency key too long'),
    customer_name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    customer_phone: phoneSchema,
    service_slug: z.enum([
        'secret-gift',
        'mini-proposal',
        'birthday-surprise',
        'hero-entry',
    ], {
        errorMap: () => ({ message: 'Please select a valid MIRSTOERA experience' }),
    }),
    event_date: eventDateSchema,
    event_time: z
        .string()
        .trim()
        .min(1, 'Please specify a preferred event time')
        .max(50, 'Event time is too long'),
    event_area: z
        .string()
        .trim()
        .min(2, 'Please specify an area or landmark in Coimbatore')
        .max(100, 'Area description cannot exceed 100 characters'),
    recipient_relationship: z
        .string()
        .trim()
        .min(2, 'Please select or specify your relationship to the recipient')
        .max(50, 'Relationship is too long'),
    description: z
        .string()
        .trim()
        .min(10, 'Please describe your surprise vision (at least 10 characters)')
        .max(2000, 'Description cannot exceed 2000 characters'),
    budget_inr: z
        .preprocess((val) => val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))
        ? null
        : typeof val === 'string'
            ? (Number.isNaN(Number(val)) || val.trim() === '' ? null : Number(val))
            : val, z.number().int('Budget must be an integer').positive('Budget must be positive').nullable().optional()),
    additional_preferences: z
        .string()
        .trim()
        .max(1000, 'Additional preferences cannot exceed 1000 characters')
        .optional()
        .nullable(),
    privacy_consent: z
        .boolean()
        .refine((val) => val === true, {
        message: 'You must agree to the privacy policy and terms to proceed.',
    }),
});
export const adminLoginSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const adminStatusUpdateSchema = z.object({
    status: z.enum(ENQUIRY_STATUSES),
    quoted_price_inr: z.number().int().positive().optional().nullable(),
    quoted_price_paise: z.number().int().positive().optional().nullable(),
    note: z.string().trim().max(2000).optional(),
});
export const adminNoteCreateSchema = z.object({
    note: z.string().trim().min(1, 'Note cannot be empty').max(2000, 'Note cannot exceed 2000 characters'),
});
export const serviceCreateSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(2, 'Slug must be at least 2 characters')
        .max(100)
        .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
    tagline: z.string().trim().max(200).optional().default(''),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
    starting_price_inr: z.number().int().positive('Starting price must be a positive integer in INR'),
    cover_image_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
    is_active: z.boolean().optional().default(true),
    display_order: z.number().int().optional().default(0),
});
export const serviceUpdateSchema = z.object({
    title: z.string().trim().min(2).max(100).optional(),
    tagline: z.string().trim().max(200).optional().nullable(),
    description: z.string().trim().min(10).max(2000).optional(),
    starting_price_inr: z.number().int().positive().optional(),
    starting_price_paise: z.number().int().positive().optional(),
    cover_image_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
    is_active: z.boolean().optional(),
    display_order: z.number().int().optional(),
});
export const businessSettingsUpdateSchema = z.object({
    brand_name: z.string().trim().min(1).max(100).optional(),
    tagline: z.string().trim().min(1).max(200).optional(),
    phone: z.string().trim().min(8).max(20).optional(),
    whatsapp: z.string().trim().min(8).max(20).optional(),
    notification_recipient: z.string().trim().min(8).max(20).optional(),
    email: z.string().trim().email().optional(),
    service_coverage: z.string().trim().min(2).max(200).optional(),
    business_hours: z.string().trim().min(2).max(200).optional(),
    instagram_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
    facebook_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
    youtube_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
    twitter_url: z.string().trim().url().optional().or(z.literal('')).nullable(),
});
//# sourceMappingURL=index.js.map