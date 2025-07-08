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
