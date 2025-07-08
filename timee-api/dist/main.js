"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const app_module_1 = require("./app.module");
const environment_config_1 = require("./config/environment.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableCors({
        origin: (origin, callback) => {
            logger.log(`🌐 CORS request from origin: ${origin || 'no-origin'}`);
            if (!origin) {
                logger.log('✅ No origin header - allowing request');
                return callback(null, true);
            }
            const isAllowed = environment_config_1.config.allowedOrigins.some(allowedOrigin => {
                const matches = origin === allowedOrigin ||
                    origin.endsWith('.timee.group') ||
                    origin.includes('sealoshzh.site') ||
                    origin.includes('localhost');
                if (matches) {
                    logger.log(`✅ Origin ${origin} matches ${allowedOrigin}`);
                }
                return matches;
            });
            if (isAllowed || environment_config_1.config.corsOrigin === '*') {
                logger.log(`✅ Allowing origin: ${origin}`);
                return callback(null, true);
            }
            else {
                logger.warn(`❌ CORS blocked origin: ${origin}`);
                logger.warn(`📋 Allowed origins: ${environment_config_1.config.allowedOrigins.join(', ')}`);
                return callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Access-Control-Allow-Origin',
            'Cache-Control',
            'X-Forwarded-For',
            'X-Real-IP'
        ],
        optionsSuccessStatus: 200,
        preflightContinue: false
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        disableErrorMessages: false,
        validationError: {
            target: false,
            value: false,
        },
    }));
    app.setGlobalPrefix('api');
    await app.listen(environment_config_1.config.port, '0.0.0.0');
    logger.log(`🚀 Server running on http://localhost:${environment_config_1.config.port}`);
    logger.log(`🌐 Environment: ${environment_config_1.config.nodeEnv}`);
    logger.log(`🌐 CORS Origin: ${environment_config_1.config.corsOrigin}`);
    logger.log(`🌐 Allowed Origins: ${environment_config_1.config.allowedOrigins.join(', ')}`);
    logger.log(`📡 API available at: http://localhost:${environment_config_1.config.port}/api`);
    logger.log(`🌍 External URL: ${environment_config_1.config.externalApiUrl}`);
    logger.log(`🔧 Rate limiting: ${environment_config_1.config.rateLimit.max} requests per ${environment_config_1.config.rateLimit.windowMs / 60000} minutes`);
}
bootstrap();
//# sourceMappingURL=main.js.map