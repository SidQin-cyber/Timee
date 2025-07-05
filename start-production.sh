#!/bin/bash

# 稳健的生产环境启动脚本
echo "🚀 启动 Timee 服务..."

# 确保在正确的目录
cd "$(dirname "$0")"

# 创建日志目录
mkdir -p logs

# 停止现有进程
echo "🛑 停止现有进程..."
./stop-production.sh

# 安装代理服务器依赖
echo "📦 安装代理服务器依赖..."
npm install

# 启动后端API
echo "🔧 启动后端API..."
cd timee-api
npm install --legacy-peer-deps
if [ ! -f "dist/main.js" ]; then
    echo "构建后端..."
    npm run build
fi
nohup npm run start:prod > ../logs/api.log 2>&1 &
API_PID=$!
echo "后端API启动，PID: $API_PID"
cd ..

# 启动前端
echo "🎨 启动前端..."
cd timee-frontend/apps/web
npm install
if [ ! -d "dist" ]; then
    echo "构建前端..."
    npm run build
fi
nohup npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端启动，PID: $FRONTEND_PID"
cd ../../..

# 健康检查函数
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "🔍 检查 $service_name 服务状态..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name 服务就绪"
            return 0
        fi
        
        echo "⏳ 等待 $service_name 服务启动... (尝试 $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name 服务启动失败或超时"
    return 1
}

# 等待并检查后端服务
if ! check_service "后端API" "http://localhost:3000/api/health"; then
    echo "❌ 后端服务启动失败，检查日志:"
    tail -20 logs/api.log
    exit 1
fi

# 等待并检查前端服务
if ! check_service "前端应用" "http://localhost:5173"; then
    echo "❌ 前端服务启动失败，检查日志:"
    tail -20 logs/frontend.log
    exit 1
fi

# 启动代理服务器
echo "🔀 启动代理服务器..."
nohup npm start > logs/proxy.log 2>&1 &
PROXY_PID=$!
echo "代理服务器启动，PID: $PROXY_PID"

# 等待并检查代理服务器
if ! check_service "代理服务器" "http://localhost:8080/health"; then
    echo "❌ 代理服务器启动失败，检查日志:"
    tail -20 logs/proxy.log
    exit 1
fi

# 保存PID到文件
echo "$API_PID" > logs/api.pid
echo "$FRONTEND_PID" > logs/frontend.pid
echo "$PROXY_PID" > logs/proxy.pid

echo ""
echo "✅ 所有服务已启动并通过健康检查！"
echo ""
echo "📊 服务状态:"
echo "   - 后端API: PID $API_PID (端口 3000) ✅"
echo "   - 前端应用: PID $FRONTEND_PID (端口 5173) ✅"
echo "   - 代理服务器: PID $PROXY_PID (端口 8080) ✅"
echo ""
echo "📋 常用命令:"
echo "   - 查看日志: tail -f logs/*.log"
echo "   - 停止服务: ./stop-production.sh"
echo "   - 检查服务: ps aux | grep -E 'node|npm'"
echo ""
echo "🌐 访问地址:"
echo "   - 外部访问: http://wmxkwzbmhlj.sealoshzh.site"
echo "   - 本地访问: http://localhost:8080"
echo ""
echo "🔍 最终健康检查..."
curl -s http://localhost:8080/health | jq . || echo "代理服务器健康检查完成" 