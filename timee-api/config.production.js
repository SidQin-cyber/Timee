// 生产环境配置
module.exports = {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_URL: 'postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres',
  JWT_SECRET: 'timee-super-secure-jwt-secret-2024',
  CORS_ORIGIN: 'https://timee.group',
  LOG_LEVEL: 'info',
  HEALTH_CHECK_ENABLED: true
} 