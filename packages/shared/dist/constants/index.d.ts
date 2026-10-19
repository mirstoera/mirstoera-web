export declare const BRAND_CONSTANTS: {
    readonly NAME: "MIRSTOERA";
    readonly TAGLINE: "Every Moment Deserves a Crown.";
    readonly LOCATION: "Coimbatore, Tamil Nadu, India";
    readonly CITY: "Coimbatore";
    readonly STATE: "Tamil Nadu";
    readonly COUNTRY: "India";
    readonly CURRENCY_CODE: "INR";
    readonly CURRENCY_SYMBOL: "₹";
    readonly DEFAULT_PHONE: "+919876543210";
    readonly DEFAULT_WHATSAPP: "+919876543210";
    readonly DEFAULT_EMAIL: "concierge@mirstoera.in";
    readonly DEFAULT_BUSINESS_HOURS: "Monday to Sunday: 09:00 AM - 09:00 PM IST";
    readonly TIMEZONE: "Asia/Kolkata";
    readonly DEFAULT_INSTAGRAM: "https://instagram.com/mirstoera.in";
    readonly DEFAULT_FACEBOOK: "https://facebook.com/mirstoera";
    readonly DEFAULT_YOUTUBE: "https://youtube.com/@mirstoera";
    readonly DEFAULT_TWITTER: "https://twitter.com/mirstoera";
};
export interface ServiceDetailDefinition {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    starting_price_paise: number;
    starting_price_inr: number;
    inclusions: string[];
    exclusions?: string[];
    conditions?: string[];
    safety_guidelines?: string[];
    hero_image: string;
    display_order: number;
}
export declare const OFFICIAL_SERVICES: Record<string, ServiceDetailDefinition>;
export declare const ENQUIRY_STATUSES: readonly ["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"];
export type EnquiryStatus = typeof ENQUIRY_STATUSES[number];
export declare const VALID_STATUS_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]>;
export declare const NOTIFICATION_STATUSES: readonly ["PENDING", "PROCESSING", "SENT", "FAILED", "DISABLED"];
export type NotificationStatus = typeof NOTIFICATION_STATUSES[number];
export declare const RECIPIENT_RELATIONSHIPS: readonly ["Partner/Spouse", "Fiancé/Fiancée", "Best Friend", "Parent (Mother/Father)", "Child (Son/Daughter)", "Sibling (Brother/Sister)", "Colleague / Mentor", "Other"];
export declare const COIMBATORE_AREAS: readonly ["RS Puram", "Race Course", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Saravanampatti", "Singanallur", "Ramanathapuram", "Vadavalli", "Kovaipudur", "Ganapathy", "Sowripalayam", "Kuniyamuthur", "Thudiyalur", "Hopes College / Civil Aerodrome", "Other Area in Coimbatore"];
//# sourceMappingURL=index.d.ts.map