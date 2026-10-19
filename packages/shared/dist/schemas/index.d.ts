import { z } from 'zod';
/**
 * Normalizes Indian phone numbers to 10 digits.
 * Accepts formats: +919876543210, 919876543210, 09876543210, 9876543210, with optional spaces/dashes.
 */
export declare function normalizeIndianPhone(phoneStr: string): string;
export declare const phoneSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
/**
 * Checks that date is not in the past.
 * Uses YYYY-MM-DD string comparison with current date.
 */
export declare const eventDateSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const enquirySubmissionSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    customer_name: z.ZodString;
    customer_phone: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    service_slug: z.ZodEnum<["secret-gift", "mini-proposal", "birthday-surprise", "hero-entry"]>;
    event_date: z.ZodEffects<z.ZodString, string, string>;
    event_time: z.ZodString;
    event_area: z.ZodString;
    recipient_relationship: z.ZodString;
    description: z.ZodString;
    budget_inr: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
    additional_preferences: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    privacy_consent: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    idempotency_key: string;
    customer_name: string;
    customer_phone: string;
    service_slug: "secret-gift" | "mini-proposal" | "birthday-surprise" | "hero-entry";
    event_date: string;
    event_time: string;
    event_area: string;
    recipient_relationship: string;
    description: string;
    privacy_consent: boolean;
    budget_inr?: number | null | undefined;
    additional_preferences?: string | null | undefined;
}, {
    idempotency_key: string;
    customer_name: string;
    customer_phone: string;
    service_slug: "secret-gift" | "mini-proposal" | "birthday-surprise" | "hero-entry";
    event_date: string;
    event_time: string;
    event_area: string;
    recipient_relationship: string;
    description: string;
    privacy_consent: boolean;
    budget_inr?: unknown;
    additional_preferences?: string | null | undefined;
}>;
export type EnquirySubmissionInput = z.infer<typeof enquirySubmissionSchema>;
export declare const adminLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export declare const adminStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"]>;
    quoted_price_inr: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    quoted_price_paise: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "NEW" | "CONTACTED" | "QUOTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    quoted_price_inr?: number | null | undefined;
    quoted_price_paise?: number | null | undefined;
    note?: string | undefined;
}, {
    status: "NEW" | "CONTACTED" | "QUOTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    quoted_price_inr?: number | null | undefined;
    quoted_price_paise?: number | null | undefined;
    note?: string | undefined;
}>;
export type AdminStatusUpdateInput = z.infer<typeof adminStatusUpdateSchema>;
export declare const adminNoteCreateSchema: z.ZodObject<{
    note: z.ZodString;
}, "strip", z.ZodTypeAny, {
    note: string;
}, {
    note: string;
}>;
export type AdminNoteCreateInput = z.infer<typeof adminNoteCreateSchema>;
export declare const serviceCreateSchema: z.ZodObject<{
    slug: z.ZodString;
    title: z.ZodString;
    tagline: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    description: z.ZodString;
    starting_price_inr: z.ZodNumber;
    cover_image_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    is_active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    display_order: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    slug: string;
    title: string;
    tagline: string;
    starting_price_inr: number;
    is_active: boolean;
    display_order: number;
    cover_image_url?: string | null | undefined;
}, {
    description: string;
    slug: string;
    title: string;
    starting_price_inr: number;
    tagline?: string | undefined;
    cover_image_url?: string | null | undefined;
    is_active?: boolean | undefined;
    display_order?: number | undefined;
}>;
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export declare const serviceUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    tagline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    starting_price_inr: z.ZodOptional<z.ZodNumber>;
    starting_price_paise: z.ZodOptional<z.ZodNumber>;
    cover_image_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    display_order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    tagline?: string | null | undefined;
    starting_price_inr?: number | undefined;
    cover_image_url?: string | null | undefined;
    is_active?: boolean | undefined;
    display_order?: number | undefined;
    starting_price_paise?: number | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    tagline?: string | null | undefined;
    starting_price_inr?: number | undefined;
    cover_image_url?: string | null | undefined;
    is_active?: boolean | undefined;
    display_order?: number | undefined;
    starting_price_paise?: number | undefined;
}>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export declare const businessSettingsUpdateSchema: z.ZodObject<{
    brand_name: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    notification_recipient: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    service_coverage: z.ZodOptional<z.ZodString>;
    business_hours: z.ZodOptional<z.ZodString>;
    instagram_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    facebook_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    youtube_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    twitter_url: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    tagline?: string | undefined;
    brand_name?: string | undefined;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    notification_recipient?: string | undefined;
    service_coverage?: string | undefined;
    business_hours?: string | undefined;
    instagram_url?: string | null | undefined;
    facebook_url?: string | null | undefined;
    youtube_url?: string | null | undefined;
    twitter_url?: string | null | undefined;
}, {
    email?: string | undefined;
    tagline?: string | undefined;
    brand_name?: string | undefined;
    phone?: string | undefined;
    whatsapp?: string | undefined;
    notification_recipient?: string | undefined;
    service_coverage?: string | undefined;
    business_hours?: string | undefined;
    instagram_url?: string | null | undefined;
    facebook_url?: string | null | undefined;
    youtube_url?: string | null | undefined;
    twitter_url?: string | null | undefined;
}>;
export type BusinessSettingsUpdateInput = z.infer<typeof businessSettingsUpdateSchema>;
//# sourceMappingURL=index.d.ts.map