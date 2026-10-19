import { createApp } from './app.js';
import { config } from './config/index.js';
const { app } = createApp();
const server = app.listen(config.port, () => {
    console.log(`👑 MIRSTOERA API server running on port ${config.port} (${config.env})`);
    console.log(`   Base API URL: http://localhost:${config.port}/api`);
    console.log(`   Database Mode: ${config.databaseMode}`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map