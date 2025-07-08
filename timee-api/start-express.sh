#!/bin/bash
echo "🚀 Starting Timee Express API for Sealos..."

# 确保正确环境变量
export PORT=8080
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres?schema=public"

# 停止所有现有进程
pkill -f "src/index.js" 2>/dev/null
pkill -f "node" 2>/dev/null || true

# 等待端口释放
sleep 2

# 生成 Prisma 客户端
echo "📦 Generating Prisma client..."
npx prisma generate

# 应用数据库迁移
echo "🗄️ Applying database migrations..."
npx prisma migrate deploy

# 启动应用
echo "✨ Starting Express server on port $PORT..."
node src/index.js 