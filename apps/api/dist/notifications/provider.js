import { config } from '../config/index.js';
/**
 * Builds standard WhatsApp Click-to-Chat URL
 * Example: https://wa.me/919876543210?text=Hello!%20This%20is%20MIRSTOERA...
 */
export function buildWhatsAppChatUrl(phone, text) {
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone}`;
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}
export class ManualNotificationProvider {
    name = 'manual';
    validateConfiguration() {
        return true;
    }
    getProviderStatus() {
        return 'manual_only';
    }
    async send(payload) {
        const defaultText = `Hello ${payload.customerName}! This is MIRSTOERA Concierge. Thank you for your royal enquiry (${payload.referenceCode}) for ${payload.serviceTitle} on ${payload.eventDate} in ${payload.eventArea}. We would love to help craft this special moment for you!`;
        const waUrl = buildWhatsAppChatUrl(payload.customerPhone, defaultText);
        console.log(`[ManualNotificationProvider] Prepared WhatsApp click-to-chat link for ${payload.referenceCode} (recipient ending in ...${payload.customerPhone.slice(-4)})`);
        return {
            success: true,
            provider: 'manual',
            messageId: `manual-${payload.referenceCode}-${Date.now()}`,
        };
    }
}
export class WhatsAppCloudAPIProvider {
    name = 'cloud_api';
    validateConfiguration() {
        return Boolean(config.whatsappApiToken && config.whatsappPhoneNumberId);
    }
    getProviderStatus() {
        return this.validateConfiguration() ? 'ready' : 'unconfigured';
    }
    async send(payload) {
        if (!this.validateConfiguration()) {
            return {
                success: false,
                provider: 'cloud_api',
                error: 'WhatsApp Cloud API credentials not configured in environment',
            };
        }
        try {
            const recipient = payload.recipientPhone || payload.customerPhone;
            const cleanPhone = recipient.replace(/\D/g, '');
            const to = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
            const res = await fetch(`https://graph.facebook.com/v18.0/${config.whatsappPhoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${config.whatsappApiToken}`,
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to,
                    type: 'text',
                    text: {
                        body: `👑 MIRSTOERA Alert: New Royal Enquiry ${payload.referenceCode} received from ${payload.customerName} for ${payload.serviceTitle} on ${payload.eventDate}.`,
                    },
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                return {
                    success: false,
                    provider: 'cloud_api',
                    error: json?.error?.message || `HTTP ${res.status}`,
                };
            }
            return {
                success: true,
                provider: 'cloud_api',
                messageId: json?.messages?.[0]?.id,
            };
        }
        catch (err) {
            return {
                success: false,
                provider: 'cloud_api',
                error: err.message || 'Network request failed',
            };
        }
    }
}
export function createNotificationProvider() {
    if (config.whatsappNotificationProvider === 'cloud_api') {
        const cloudProvider = new WhatsAppCloudAPIProvider();
        if (cloudProvider.validateConfiguration()) {
            return cloudProvider;
        }
    }
    return new ManualNotificationProvider();
}
//# sourceMappingURL=provider.js.map