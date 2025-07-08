#!/bin/bash

echo "🛑 停止所有服务..."

# 停止通过 PID 文件记录的进程
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    rm .frontend.pid
fi

if [ -f .proxy.pid ]; then
    PROXY_PID=$(cat .proxy.pid)
    kill $PROXY_PID 2>/dev/null
    echo "✅ 代理服务已停止 (PID: $PROXY_PID)"
    rm .proxy.pid
fi

# 停止所有可能的 Node.js 进程
pkill -f "node.*timee" 2>/dev/null
pkill -f "npm.*preview" 2>/dev/null
pkill -f "npm.*start:prod" 2>/dev/null

echo "🎉 所有服务已停止！" 