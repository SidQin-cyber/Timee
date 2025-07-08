#!/bin/bash

echo "🔧 修复 Timee 生产环境 CORS 问题..."

# 1. 更新环境变量以支持所有必要的域名
echo "📝 更新环境变量..."

# 设置更宽松的生产环境 CORS 配置
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db"
export JWT_SECRET="TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM="
export PROXY_PORT=8080

# 关键修复：设置支持多个域名的 CORS 配置
export CORS_ORIGIN="*"  # 临时设置为允许所有来源，用于调试
export ALLOWED_ORIGINS="https://timee.group,https://wmxkwzbmhflj.sealoshzh.site,http://localhost:5173,http://localhost:8080"

echo "✅ 环境变量已更新"
echo "   CORS_ORIGIN: $CORS_ORIGIN"
echo "   ALLOWED_ORIGINS: $ALLOWED_ORIGINS"

# 2. 创建临时的宽松 CORS 配置文件
echo "📝 创建临时 CORS 配置..."

cat > timee-api/cors-fix.js << 'EOF'
// 临时 CORS 修复配置
module.exports = {
  origin: (origin, callback) => {
    // 在生产环境中临时允许所有来源，用于调试
    console.log('CORS Request from origin:', origin);
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
    'Access-Control-Allow-Origin'
  ],
  optionsSuccessStatus: 200
};
EOF

# 3. 创建修复后的环境配置
echo "📝 创建修复后的环境配置..."

cat > timee-api/src/config/environment.config.fixed.ts << 'EOF'
export interface EnvironmentConfig {
  port: number
  nodeEnv: string
  databaseUrl: string
  corsOrigin: string
  allowedOrigins: string[]
  jwtSecret: string
  redisUrl?: string
  externalApiUrl: string
  logLevel: string
  rateLimit: {
    max: number
    windowMs: number
  }
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  // 修复后的生产环境配置 - 更宽松的 CORS 设置
  const productionDefaults = {
    port: 3000,
    corsOrigin: '*', // 临时设置为允许所有来源
    allowedOrigins: [
      'https://timee.group',
      'https://wmxkwzbmhflj.sealoshzh.site',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ],
    logLevel: 'debug', // 改为 debug 以便查看详细日志
    rateLimit: {
      max: 200, // 增加请求限制
      windowMs: 900000
    }
  }

  // 开发环境配置保持不变
  const developmentDefaults = {
    port: 3000,
    corsOrigin: '*',
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:8080',
      'https://wmxkwzbmhflj.sealoshzh.site'
    ],
    logLevel: 'debug',
    rateLimit: {
      max: 200,
      windowMs: 900000
    }
  }

  const defaults = nodeEnv === 'production' ? productionDefaults : developmentDefaults

  return {
    port: parseInt(process.env.PORT || process.env.API_PORT || defaults.port.toString(), 10),
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || '',
    corsOrigin: process.env.CORS_ORIGIN || defaults.corsOrigin,
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : defaults.allowedOrigins,
    jwtSecret: process.env.JWT_SECRET || 'default-development-secret',
    redisUrl: process.env.REDIS_URL,
    externalApiUrl: process.env.EXTERNAL_API_URL || (nodeEnv === 'production' ? 'https://timee.group' : 'https://wmxkwzbmhflj.sealoshzh.site'),
    logLevel: process.env.LOG_LEVEL || defaults.logLevel,
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || defaults.rateLimit.max.toString(), 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || defaults.rateLimit.windowMs.toString(), 10)
    }
  }
}

export const config = getEnvironmentConfig()
EOF

# 4. 创建修复后的主应用文件
echo "📝 创建修复后的主应用文件..."

cat > timee-api/src/main.fixed.ts << 'EOF'
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
EOF

# 5. 备份原始文件并应用修复
echo "💾 备份原始文件..."
if [ -f "timee-api/src/config/environment.config.ts" ]; then
    cp timee-api/src/config/environment.config.ts timee-api/src/config/environment.config.ts.backup
fi

if [ -f "timee-api/src/main.ts" ]; then
    cp timee-api/src/main.ts timee-api/src/main.ts.backup
fi

echo "🔄 应用修复..."
cp timee-api/src/config/environment.config.fixed.ts timee-api/src/config/environment.config.ts
cp timee-api/src/main.fixed.ts timee-api/src/main.ts

# 6. 重新构建后端
echo "🔨 重新构建后端..."
cd timee-api
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败，恢复备份文件"
    cp src/config/environment.config.ts.backup src/config/environment.config.ts
    cp src/main.ts.backup src/main.ts
    exit 1
fi
cd ..

# 7. 创建快速重启脚本
echo "📝 创建快速重启脚本..."

cat > restart-with-fix.sh << 'EOF'
#!/bin/bash

echo "🔄 使用 CORS 修复重启 Timee 服务..."

# 停止现有服务
pkill -f "dist/main" 2>/dev/null
pkill -f "npm run preview" 2>/dev/null
pkill -f "proxy-server" 2>/dev/null

# 设置修复后的环境变量
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db"
export JWT_SECRET="TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM="
export CORS_ORIGIN="*"
export ALLOWED_ORIGINS="https://timee.group,https://wmxkwzbmhflj.sealoshzh.site,http://localhost:5173,http://localhost:8080"
export LOG_LEVEL="debug"
export PROXY_PORT=8080

# 启动后端
echo "📡 启动后端 API..."
cd timee-api
nohup node dist/main > ../logs/api-fixed.log 2>&1 &
API_PID=$!
echo "后端 PID: $API_PID"
cd ..

# 等待后端启动
sleep 5

# 启动前端
echo "🌐 启动前端..."
cd timee-frontend/apps/web
nohup npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend-fixed.log 2>&1 &
FRONTEND_PID=$!
echo "前端 PID: $FRONTEND_PID"
cd ../../..

# 启动代理
echo "🔄 启动代理服务器..."
nohup node proxy-server.js > logs/proxy-fixed.log 2>&1 &
PROXY_PID=$!
echo "代理 PID: $PROXY_PID"

# 等待服务启动
sleep 10

echo "✅ 服务已启动，使用修复后的 CORS 配置"
echo "🌐 访问地址: http://localhost:8080"
echo "📝 日志文件:"
echo "   - 后端: logs/api-fixed.log"
echo "   - 前端: logs/frontend-fixed.log"  
echo "   - 代理: logs/proxy-fixed.log"
EOF

chmod +x restart-with-fix.sh

echo ""
echo "🎉 CORS 修复完成！"
echo ""
echo "📋 修复内容:"
echo "   ✅ 更新了 CORS 配置以允许所有来源（临时调试用）"
echo "   ✅ 增加了详细的 CORS 日志记录"
echo "   ✅ 放宽了验证管道配置"
echo "   ✅ 创建了快速重启脚本"
echo ""
echo "🚀 下一步:"
echo "   1. 运行: ./restart-with-fix.sh"
echo "   2. 访问: http://localhost:8080/production-debug.html"
echo "   3. 测试创建活动和点赞功能"
echo "   4. 查看日志: tail -f logs/api-fixed.log"
echo ""
echo "⚠️  注意: 这是临时修复方案，调试完成后需要恢复安全的 CORS 配置" 