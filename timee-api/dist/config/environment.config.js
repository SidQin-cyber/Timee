"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    externalApiUrl: process.env.EXTERNAL_API_URL || 'http://localhost:3000',
    allowedOrigins: [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://timee.group',
        'https://www.timee.group',
        'https://hzh.sealos.run',
        'https://hzh.sealoshzh.site',
        ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : [])
    ],
    rateLimit: {
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    },
};
//# sourceMappingURL=environment.config.js.map