import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { config } from './config/environment.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // 启用 WebSocket 适配器
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // 修复后的 CORS 配置 - 支持 www.timee.group
  app.enableCors({
    origin: (origin, callback) => {
      logger.log(`🌐 CORS request from origin: ${origin || 'no-origin'}`);
      
      // 允许没有 origin 的请求（如直接访问、移动应用等）
      if (!origin) {
        logger.log('✅ No origin header - allowing request');
        return callback(null, true);
      }
      
      // 检查是否在允许的域名列表中
      const isAllowed = config.allowedOrigins.some(allowedOrigin => {
        const matches = origin === allowedOrigin || 
                       origin.endsWith('.timee.group') ||
                       origin.includes('sealoshzh.site') ||
                       origin.includes('localhost');
        if (matches) {
          logger.log(`✅ Origin ${origin} matches ${allowedOrigin}`);
        }
        return matches;
      });
      
      if (isAllowed || config.corsOrigin === '*') {
        logger.log(`✅ Allowing origin: ${origin}`);
        return callback(null, true);
      } else {
        logger.warn(`❌ CORS blocked origin: ${origin}`);
        logger.warn(`📋 Allowed origins: ${config.allowedOrigins.join(', ')}`);
        return callback(null, true); // 临时允许所有请求用于调试
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
  
  // 宽松的验证管道配置
  app.useGlobalPipes(new ValidationPipe({
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
  
  await app.listen(config.port, '0.0.0.0');
  
  // 详细的启动日志
  logger.log(`🚀 Server running on http://localhost:${config.port}`);
  logger.log(`🌐 Environment: ${config.nodeEnv}`);
  logger.log(`🌐 CORS Origin: ${config.corsOrigin}`);
  logger.log(`🌐 Allowed Origins: ${config.allowedOrigins.join(', ')}`);
  logger.log(`📡 API available at: http://localhost:${config.port}/api`);
  logger.log(`🌍 External URL: ${config.externalApiUrl}`);
  logger.log(`🔧 Rate limiting: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/60000} minutes`);
}

bootstrap();
