#!/bin/bash

echo "🚀 Starting Timee Application Stack (Production Mode)..."

# 设置环境变量
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db}"
export JWT_SECRET="${JWT_SECRET:-TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=}"
export CORS_ORIGIN="${CORS_ORIGIN:-https://timee.group}"

echo "📋 Environment: $NODE_ENV"
echo "🔗 Database URL: ${DATABASE_URL}"
echo "🌐 CORS Origin: ${CORS_ORIGIN}"

# 确保日志目录存在
mkdir -p logs

# 信号处理函数
cleanup() {
    echo "🔄 Shutting down services..."
    pkill -P $$
    exit 0
}

# 捕获信号
trap cleanup SIGTERM SIGINT

# 启动后端 API (在3000端口)
echo "📡 Starting Backend API on port 3000..."
cd timee-api
PORT=3000 nohup node dist/main > ../logs/api.log 2>&1 &
API_PID=$!
echo $API_PID > ../logs/api.pid

# 启动前端预览服务器 (在5173端口)
echo "🌐 Starting Frontend preview server on port 5173..."
cd ../timee-frontend/apps/web
nohup npm run preview -- --port 5173 --host 0.0.0.0 > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../../logs/frontend.pid

# 等待服务启动
echo "⏳ Waiting for services to start..."
sleep 15

# 检查服务状态
echo "🔍 Checking service status..."
if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ Backend API failed to start"
    echo "📝 Backend API logs:"
    cat ../../../logs/api.log | tail -20
    exit 1
fi

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend service failed to start"
    echo "📝 Frontend logs:"
    cat ../../../logs/frontend.log | tail -20
    exit 1
fi

# 启动代理服务器 (在8080端口 - App Launchpad期望的端口)
cd ../../../
echo "🔄 Starting Proxy Server on port 8080..."
PROXY_PORT=8080 node proxy-server.js &
PROXY_PID=$!
echo $PROXY_PID > logs/proxy.pid

# 等待代理服务器启动
sleep 5

echo "✅ All services started successfully!"
echo "🌐 Application accessible via App Launchpad!"
echo "📝 Process IDs: API=$API_PID, Frontend=$FRONTEND_PID, Proxy=$PROXY_PID"

# 健康检查
echo "🩺 Performing health check..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "⚠️ Health check failed, but continuing..."
fi

# 等待代理服务器进程 (保持容器运行)
wait $PROXY_PID 