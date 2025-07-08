#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking Timee Services Status...${NC}"
echo "========================================"

# 检查进程状态
echo -e "${YELLOW}📊 Process Status:${NC}"
ps aux | grep -E "(node.*timee|vite|nest.*start|proxy-server)" | grep -v grep | grep -v cursor | while read line; do
    echo "   $line"
done

echo ""

# 检查端口监听
echo -e "${YELLOW}🔌 Port Status:${NC}"
netstat -tlnp | grep -E "(3000|5173|8080)" | grep LISTEN | while read line; do
    echo "   $line"
done

echo ""

# 检查服务健康状态
echo -e "${YELLOW}🩺 Health Check:${NC}"

# 检查后端API
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "   Backend API (3000): ${GREEN}✅ OK${NC}"
else
    echo -e "   Backend API (3000): ${RED}❌ FAILED${NC}"
fi

# 检查前端服务
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "   Frontend (5173): ${GREEN}✅ OK${NC}"
else
    echo -e "   Frontend (5173): ${RED}❌ FAILED${NC}"
fi

# 检查代理服务器
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "   Proxy Server (8080): ${GREEN}✅ OK${NC}"
else
    echo -e "   Proxy Server (8080): ${RED}❌ FAILED${NC}"
fi

# 检查外部域名
echo -e "   External Domain: ${YELLOW}Testing...${NC}"
if curl -I -m 10 https://wmxkwzbmhflj.sealoshzh.site > /dev/null 2>&1; then
    echo -e "   External Domain: ${GREEN}✅ OK${NC}"
else
    echo -e "   External Domain: ${RED}❌ FAILED${NC}"
fi

echo ""

# 显示访问链接
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "   Local Frontend: http://localhost:5173"
echo -e "   Local API: http://localhost:3000/api"
echo -e "   Local Proxy: http://localhost:8080"
echo -e "   External URL: https://wmxkwzbmhflj.sealoshzh.site"
echo -e "   External API: https://wmxkwzbmhflj.sealoshzh.site/api"

echo ""

# 显示日志文件
echo -e "${BLUE}📝 Log Files:${NC}"
echo -e "   Backend: logs/backend.log"
echo -e "   Frontend: logs/frontend.log"
echo -e "   Proxy: logs/proxy.log"

echo ""
echo -e "${GREEN}Status check completed!${NC}" 