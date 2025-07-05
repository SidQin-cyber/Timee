#!/bin/bash
echo "🚀 Starting Timee API for Sealos..."

# 确保正确环境变量
export PORT=8080
export NODE_ENV=development
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres?schema=public"

# 停止所有现有进程
pkill -f "dist/main" 2>/dev/null
pkill -f "nest" 2>/dev/null

# 构建应用
npm run build

# 启动应用
echo "Starting on port $PORT..."
node dist/main 