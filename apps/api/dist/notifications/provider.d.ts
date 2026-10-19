export interface NotificationPayload {
    enquiryId: number;
    referenceCode: string;
    customerName: string;
    customerPhone: string;
    serviceTitle: string;
    eventDate: string;
    eventArea: string;
    recipientPhone?: string;
}
export interface NotificationResult {
    success: boolean;
    provider: string;
    messageId?: string;
    error?: string;
}
export interface NotificationProvider {
    name: string;
    send(payload: NotificationPayload): Promise<NotificationResult>;
    validateConfiguration(): boolean;
    getProviderStatus(): 'ready' | 'manual_only' | 'unconfigured';
}
/**
 * Builds standard WhatsApp Click-to-Chat URL
 * Example: https://wa.me/919876543210?text=Hello!%20This%20is%20MIRSTOERA...
 */
export declare function buildWhatsAppChatUrl(phone: string, text: string): string;
export declare class ManualNotificationProvider implements NotificationProvider {
    name: string;
    validateConfiguration(): boolean;
    getProviderStatus(): 'ready' | 'manual_only' | 'unconfigured';
    send(payload: NotificationPayload): Promise<NotificationResult>;
}
export declare class WhatsAppCloudAPIProvider implements NotificationProvider {
    name: string;
    validateConfiguration(): boolean;
    getProviderStatus(): 'ready' | 'manual_only' | 'unconfigured';
    send(payload: NotificationPayload): Promise<NotificationResult>;
}
export declare function createNotificationProvider(): NotificationProvider;
//# sourceMappingURL=provider.d.ts.map