import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
function findProjectRoot(startDir = process.cwd()) {
    let curr = startDir;
    while (curr !== path.dirname(curr)) {
        if (fs.existsSync(path.join(curr, 'package.json')) && fs.existsSync(path.join(curr, 'packages'))) {
            return curr;
        }
        curr = path.dirname(curr);
    }
    return startDir;
}
const rootDir = findProjectRoot();
dotenv.config({ path: path.join(rootDir, '.env') });
const rawDbPath = process.env.DATABASE_PATH || './data/momera.sqlite';
const resolvedDbPath = path.isAbsolute(rawDbPath)
    ? rawDbPath
    : path.resolve(rootDir, rawDbPath);
export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    databaseMode: process.env.DATABASE_MODE || 'local',
    databasePath: resolvedDbPath,
    sessionSecret: process.env.SESSION_SECRET || 'momera_dev_super_secret_session_key_min_32_chars_12345',
    sessionTtlHours: parseInt(process.env.SESSION_TTL_HOURS || '24', 10),
    whatsappNotificationProvider: process.env.WHATSAPP_NOTIFICATION_PROVIDER || 'manual',
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappTemplateName: process.env.WHATSAPP_TEMPLATE_NAME || 'momera_enquiry_alert',
    isProduction: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=index.js.map