import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from './config/environment.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // 修复后的 CORS 配置 - 更宽松和详细的日志
  app.enableCors({
    origin: (origin, callback) => {
      logger.log(`CORS request from origin: ${origin}`);
      
      // 临时允许所有来源，用于调试
      if (!origin) {
        logger.log('No origin header - allowing request');
        return callback(null, true);
      }
      
      // 在生产环境中也使用宽松的策略
      logger.log(`Allowing origin: ${origin}`);
      return callback(null, true);
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
      'Cache-Control'
    ],
    optionsSuccessStatus: 200
  });
  
  // 宽松的验证管道配置
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // 改为 false，更宽松
    transform: true,
    disableErrorMessages: false, // 始终显示错误信息
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
  logger.log(`🔧 Rate limiting: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/60000} minutes`);
}

bootstrap();
