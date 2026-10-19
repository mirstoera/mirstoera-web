export class NotificationService {
    notificationRepo;
    provider;
    constructor(notificationRepo, provider) {
        this.notificationRepo = notificationRepo;
        this.provider = provider;
    }
    async dispatch(outboxId, payload) {
        try {
            const result = await this.provider.send(payload);
            if (result.success) {
                await this.notificationRepo.updateStatus(outboxId, 'SENT');
            }
            else {
                await this.notificationRepo.updateStatus(outboxId, 'FAILED', result.error);
            }
        }
        catch (err) {
            console.error(`[NotificationService] Unexpected dispatch error for outbox ID ${outboxId}:`, err);
            await this.notificationRepo.updateStatus(outboxId, 'FAILED', err.message || 'Unknown notification error');
        }
    }
    async retry(outboxId) {
        const items = await this.notificationRepo.getAll(100);
        const item = items.find((i) => i.id === outboxId);
        if (!item)
            return false;
        try {
            const payload = JSON.parse(item.payload_json);
            const result = await this.provider.send(payload);
            if (result.success) {
                await this.notificationRepo.updateStatus(outboxId, 'SENT');
                return true;
            }
            else {
                await this.notificationRepo.updateStatus(outboxId, 'FAILED', result.error);
                return false;
            }
        }
        catch (err) {
            await this.notificationRepo.updateStatus(outboxId, 'FAILED', err.message);
            return false;
        }
    }
}
//# sourceMappingURL=service.js.map