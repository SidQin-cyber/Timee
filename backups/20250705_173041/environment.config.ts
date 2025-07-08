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
