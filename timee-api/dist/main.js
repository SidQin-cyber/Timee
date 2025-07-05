"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const environment_config_1 = require("./config/environment.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (environment_config_1.config.allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            else {
                logger.warn(`CORS blocked origin: ${origin}`);
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: environment_config_1.config.nodeEnv === 'production',
        validationError: {
            target: false,
            value: false,
        },
    }));
    app.setGlobalPrefix('api');
    await app.listen(environment_config_1.config.port, '0.0.0.0');
    logger.log(`🚀 Server running on http://localhost:${environment_config_1.config.port}`);
    logger.log(`🌐 Environment: ${environment_config_1.config.nodeEnv}`);
    logger.log(`🌐 External access: ${environment_config_1.config.externalApiUrl}/api`);
    logger.log(`📡 WebSocket server ready`);
    logger.log(`🔧 CORS enabled for: ${environment_config_1.config.allowedOrigins.join(', ')}`);
    logger.log(`📊 Rate limiting: ${environment_config_1.config.rateLimit.max} requests per ${environment_config_1.config.rateLimit.windowMs / 60000} minutes`);
}
bootstrap();
//# sourceMappingURL=main.js.map