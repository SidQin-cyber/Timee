#!/bin/bash

# Timee 应用自动启动脚本
# 用于容器重启后的自动恢复

set -e  # 遇到错误立即退出

echo "🚀 Timee Auto-Start Script v1.0"
echo "📅 $(date)"
echo "🔄 Starting automatic service recovery..."

# 创建日志目录
mkdir -p logs

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a logs/auto-start.log
}

# 错误处理函数
handle_error() {
    log "❌ Error occurred in line $1"
    log "🔍 Checking service status..."
    ps aux | grep -E "(node|npm)" | grep -v grep | tee -a logs/auto-start.log
    exit 1
}

# 设置错误处理
trap 'handle_error $LINENO' ERR

log "🛑 Stopping existing services..."
./stop-production.sh || true

log "🧹 Cleaning up old processes..."
pkill -f "node.*timee" || true
pkill -f "npm.*timee" || true
sleep 2

log "📦 Installing and updating dependencies..."

# 更新后端依赖
log "📦 Backend dependencies..."
cd timee-api
npm install --legacy-peer-deps --silent
if [ ! -f "dist/main.js" ]; then
    log "🔨 Building backend..."
    npx nest build
fi
cd ..

# 更新前端依赖
log "📦 Frontend dependencies..."
cd timee-frontend/apps/web
npm install --silent
if [ ! -d "dist" ]; then
    log "🔨 Building frontend..."
    npm run build
fi
cd ../../..

# 安装代理服务器依赖
log "📦 Proxy server dependencies..."
npm install --silent

# 健康检查函数
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    log "🔍 Checking $service_name on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:$port > /dev/null 2>&1; then
            log "✅ $service_name is ready (attempt $attempt/$max_attempts)"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log "❌ $service_name failed to start after $max_attempts attempts"
            return 1
        fi
        
        log "⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
}

# 启动后端服务
log "🔧 Starting backend API..."
cd timee-api
nohup npm run start:prod > ../logs/api.log 2>&1 &
API_PID=$!
echo $API_PID > ../logs/api.pid
log "📡 Backend API started with PID: $API_PID"
cd ..

# 等待后端启动
check_service "Backend API" 3000

# 启动前端服务
log "🎨 Starting frontend..."
cd timee-frontend/apps/web
nohup npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../../logs/frontend.pid
log "🌐 Frontend started with PID: $FRONTEND_PID"
cd ../../..

# 等待前端启动
check_service "Frontend" 5173

# 启动代理服务器
log "🔀 Starting proxy server..."
nohup npm start > logs/proxy.log 2>&1 &
PROXY_PID=$!
echo $PROXY_PID > logs/proxy.pid
log "🔄 Proxy server started with PID: $PROXY_PID"

# 等待代理服务器启动
check_service "Proxy Server" 8080

# 最终健康检查
log "🩺 Performing comprehensive health check..."
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    log "✅ All services are healthy!"
else
    log "⚠️ Health check warning, but services are running"
fi

# 测试外部连接
log "🌐 Testing external connectivity..."
if curl -s -f https://wmxkwzbmhflj.sealoshzh.site > /dev/null 2>&1; then
    log "✅ External URL is accessible!"
else
    log "⚠️ External URL test failed, but internal services are running"
fi

log "🎉 Auto-start completed successfully!"
log "📊 Service Status:"
log "   Backend API: PID $API_PID (port 3000)"
log "   Frontend: PID $FRONTEND_PID (port 5173)"
log "   Proxy Server: PID $PROXY_PID (port 8080)"
log "🌍 Application URL: https://wmxkwzbmhflj.sealoshzh.site"

# 保持脚本运行以监控服务
log "🔄 Monitoring services..."
while true; do
    sleep 30
    
    # 检查服务是否还在运行
    if ! kill -0 $API_PID 2>/dev/null; then
        log "❌ Backend API crashed, attempting restart..."
        cd timee-api
        nohup npm run start:prod > ../logs/api.log 2>&1 &
        API_PID=$!
        echo $API_PID > ../logs/api.pid
        log "🔄 Backend API restarted with PID: $API_PID"
        cd ..
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log "❌ Frontend crashed, attempting restart..."
        cd timee-frontend/apps/web
        nohup npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../../../logs/frontend.pid
        log "🔄 Frontend restarted with PID: $FRONTEND_PID"
        cd ../../..
    fi
    
    if ! kill -0 $PROXY_PID 2>/dev/null; then
        log "❌ Proxy server crashed, attempting restart..."
        nohup npm start > logs/proxy.log 2>&1 &
        PROXY_PID=$!
        echo $PROXY_PID > logs/proxy.pid
        log "🔄 Proxy server restarted with PID: $PROXY_PID"
    fi
done 