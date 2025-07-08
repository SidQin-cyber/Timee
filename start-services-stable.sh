#!/bin/bash

echo "🚀 Starting Timee Services (Stable Mode)..."

# 加载环境变量
source ./setup-environment.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 清理旧进程
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
pkill -f "node.*timee" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "nest.*start" 2>/dev/null
pkill -f "proxy-server" 2>/dev/null
sleep 3

# 创建日志目录
mkdir -p logs

# 启动后端API服务
echo -e "${BLUE}📡 Starting Backend API on port 3000...${NC}"
cd timee-api
nohup npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# 等待后端启动
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 15

# 检查后端状态
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API started successfully${NC}"
else
    echo -e "${RED}❌ Backend API failed to start${NC}"
    echo "Backend logs:"
    tail -20 logs/backend.log
    exit 1
fi

# 启动前端服务
echo -e "${BLUE}🌐 Starting Frontend on port 5173...${NC}"
cd timee-frontend/apps/web
nohup npm run dev > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../../logs/frontend.pid
cd ../../..

# 等待前端启动
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 15

# 检查前端状态
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend started successfully${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Frontend logs:"
    tail -20 logs/frontend.log
    exit 1
fi

# 启动代理服务器
echo -e "${BLUE}🔄 Starting Proxy Server on port 8080...${NC}"
nohup node proxy-server.js > logs/proxy.log 2>&1 &
PROXY_PID=$!
echo $PROXY_PID > logs/proxy.pid

# 等待代理服务器启动
echo -e "${YELLOW}⏳ Waiting for proxy server to start...${NC}"
sleep 10

# 检查代理服务器状态
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Proxy server started successfully${NC}"
else
    echo -e "${RED}❌ Proxy server failed to start${NC}"
    echo "Proxy logs:"
    tail -20 logs/proxy.log
    exit 1
fi

# 最终测试
echo -e "${BLUE}🧪 Testing external domain...${NC}"
if curl -I -m 10 https://wmxkwzbmhflj.sealoshzh.site > /dev/null 2>&1; then
    echo -e "${GREEN}✅ External domain is accessible${NC}"
else
    echo -e "${YELLOW}⚠️ External domain test failed, but services are running${NC}"
fi

# 显示状态
echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "   Backend API: http://localhost:3000 (PID: $BACKEND_PID)"
echo -e "   Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo -e "   Proxy Server: http://localhost:8080 (PID: $PROXY_PID)"
echo -e "   External URL: https://wmxkwzbmhflj.sealoshzh.site"
echo ""
echo -e "${YELLOW}📝 Log files:${NC}"
echo -e "   Backend: logs/backend.log"
echo -e "   Frontend: logs/frontend.log"  
echo -e "   Proxy: logs/proxy.log"
echo ""
echo -e "${GREEN}✅ Services are now running in stable mode!${NC}" 