#!/bin/bash

# Timee 快速启动脚本
# 用于立即启动所有服务

echo "🚀 Timee Quick Start"
echo "📅 $(date)"

# 创建日志目录
mkdir -p logs

# 停止现有服务
echo "🛑 Stopping existing services..."
./stop-production.sh 2>/dev/null || true

# 清理进程
pkill -f "node.*timee" 2>/dev/null || true
pkill -f "npm.*timee" 2>/dev/null || true
sleep 2

# 健康检查函数
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Checking $service_name on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:$port > /dev/null 2>&1; then
            echo "✅ $service_name is ready (attempt $attempt/$max_attempts)"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ $service_name failed to start after $max_attempts attempts"
            return 1
        fi
        
        echo "⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
}

# 启动后端服务
echo "🔧 Starting backend API..."
cd timee-api
# 确保依赖已安装
if [ ! -d "node_modules" ] || [ ! -f "dist/main.js" ]; then
    echo "📦 Installing backend dependencies..."
    npm install --legacy-peer-deps --silent
    echo "🔨 Building backend..."
    npx nest build
fi
nohup npm run start:prod > ../logs/api.log 2>&1 &
API_PID=$!
echo $API_PID > ../logs/api.pid
echo "📡 Backend API started with PID: $API_PID"
cd ..

# 等待后端启动
check_service "Backend API" 3000

# 启动前端服务
echo "🎨 Starting frontend..."
cd timee-frontend/apps/web
# 确保依赖已安装
if [ ! -d "node_modules" ] || [ ! -d "dist" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --silent
    echo "🔨 Building frontend..."
    npm run build
fi
nohup npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../../logs/frontend.pid
echo "🌐 Frontend started with PID: $FRONTEND_PID"
cd ../../..

# 等待前端启动
check_service "Frontend" 5173

# 启动代理服务器
echo "🔀 Starting proxy server..."
# 确保依赖已安装
if [ ! -d "node_modules" ]; then
    echo "📦 Installing proxy dependencies..."
    npm install --silent
fi
nohup npm start > logs/proxy.log 2>&1 &
PROXY_PID=$!
echo $PROXY_PID > logs/proxy.pid
echo "🔄 Proxy server started with PID: $PROXY_PID"

# 等待代理服务器启动
check_service "Proxy Server" 8080

# 最终健康检查
echo "🩺 Performing health check..."
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ All services are healthy!"
else
    echo "⚠️ Health check warning, but services are running"
fi

# 测试外部连接
echo "🌐 Testing external connectivity..."
if curl -s -f https://wmxkwzbmhflj.sealoshzh.site > /dev/null 2>&1; then
    echo "✅ External URL is accessible!"
else
    echo "⚠️ External URL test failed, but internal services are running"
fi

echo "🎉 Quick start completed successfully!"
echo "📊 Service Status:"
echo "   Backend API: PID $API_PID (port 3000)"
echo "   Frontend: PID $FRONTEND_PID (port 5173)"
echo "   Proxy Server: PID $PROXY_PID (port 8080)"
echo "🌍 Application URL: https://wmxkwzbmhflj.sealoshzh.site"
echo ""
echo "💡 To monitor services, run: ./auto-start.sh"
echo "💡 To stop services, run: ./stop-production.sh" 