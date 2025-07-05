import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from './config/environment.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enhanced CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });
  
  // Global validation pipe with enhanced configuration
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: config.nodeEnv === 'production',
    validationError: {
      target: false,
      value: false,
    },
  }));
  
  app.setGlobalPrefix('api');
  
  await app.listen(config.port, '0.0.0.0');
  
  // Enhanced logging
  logger.log(`🚀 Server running on http://localhost:${config.port}`);
  logger.log(`🌐 Environment: ${config.nodeEnv}`);
  logger.log(`🌐 External access: ${config.externalApiUrl}/api`);
  logger.log(`📡 WebSocket server ready`);
  logger.log(`🔧 CORS enabled for: ${config.allowedOrigins.join(', ')}`);
  logger.log(`📊 Rate limiting: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/60000} minutes`);
}
bootstrap(); 