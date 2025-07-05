#!/bin/bash

# 简化的停止脚本
echo "🛑 停止 Timee 服务..."

# 确保在正确的目录
cd "$(dirname "$0")"

# 从PID文件停止服务
if [ -f "logs/api.pid" ]; then
    API_PID=$(cat logs/api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        echo "停止后端API (PID: $API_PID)..."
        kill $API_PID
    fi
    rm -f logs/api.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm -f logs/frontend.pid
fi

if [ -f "logs/proxy.pid" ]; then
    PROXY_PID=$(cat logs/proxy.pid)
    if ps -p $PROXY_PID > /dev/null 2>&1; then
        echo "停止代理服务器 (PID: $PROXY_PID)..."
        kill $PROXY_PID
    fi
    rm -f logs/proxy.pid
fi

# 额外的清理：杀死所有相关进程
echo "清理残留进程..."
pkill -f "timee-api"
pkill -f "timee-frontend"
pkill -f "proxy-server.js"
pkill -f "npm.*start:prod"
pkill -f "npm.*preview"

# 等待进程完全停止
sleep 2

echo "✅ 所有服务已停止！"

# 显示当前状态
echo ""
echo "📊 检查残留进程:"
REMAINING=$(ps aux | grep -E "(timee|proxy-server)" | grep -v grep | wc -l)
if [ $REMAINING -eq 0 ]; then
    echo "   ✅ 没有残留进程"
else
    echo "   ⚠️ 发现 $REMAINING 个残留进程:"
    ps aux | grep -E "(timee|proxy-server)" | grep -v grep
fi 