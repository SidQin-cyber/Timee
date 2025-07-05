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
  
  // Production-specific configurations
  const productionDefaults = {
    port: 8080,
    corsOrigin: process.env.CORS_ORIGIN || 'https://wmxkwzbmhlj.sealoshzh.site',
    allowedOrigins: [
      'https://wmxkwzbmhlj.sealoshzh.site',
      'https://yourdomain.com'
    ],
    logLevel: 'warn',
    rateLimit: {
      max: 50,
      windowMs: 900000 // 15 minutes
    }
  }

  // Development-specific configurations
  const developmentDefaults = {
    port: 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ],
    logLevel: 'debug',
    rateLimit: {
      max: 200,
      windowMs: 900000 // 15 minutes
    }
  }

  const defaults = nodeEnv === 'production' ? productionDefaults : developmentDefaults

  return {
    port: parseInt(process.env.PORT || process.env.API_PORT || defaults.port.toString(), 10),
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || '',
    corsOrigin: defaults.corsOrigin,
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : defaults.allowedOrigins,
    jwtSecret: process.env.JWT_SECRET || 'default-development-secret',
    redisUrl: process.env.REDIS_URL,
    externalApiUrl: process.env.EXTERNAL_API_URL || 'https://wmxkwzbmhlj.sealoshzh.site',
    logLevel: process.env.LOG_LEVEL || defaults.logLevel,
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || defaults.rateLimit.max.toString(), 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || defaults.rateLimit.windowMs.toString(), 10)
    }
  }
}

export const config = getEnvironmentConfig() 