#!/bin/bash

# 简化的生产环境启动脚本
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

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 启动代理服务器
echo "🔀 启动代理服务器..."
nohup npm start > logs/proxy.log 2>&1 &
PROXY_PID=$!
echo "代理服务器启动，PID: $PROXY_PID"

# 保存PID到文件
echo "$API_PID" > logs/api.pid
echo "$FRONTEND_PID" > logs/frontend.pid
echo "$PROXY_PID" > logs/proxy.pid

echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "📊 服务状态:"
echo "   - 后端API: PID $API_PID (端口 3000)"
echo "   - 前端应用: PID $FRONTEND_PID (端口 5173)"
echo "   - 代理服务器: PID $PROXY_PID (端口 8080)"
echo ""
echo "📋 常用命令:"
echo "   - 查看日志: tail -f logs/*.log"
echo "   - 停止服务: ./stop-production.sh"
echo "   - 检查服务: ps aux | grep -E 'node|npm'"
echo ""
echo "🌐 访问地址:"
echo "   - 外部访问: http://wmxkwzbmhlj.sealoshzh.site"
echo "   - 本地访问: http://localhost:8080" 