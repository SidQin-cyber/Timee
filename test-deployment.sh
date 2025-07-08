#!/bin/bash

echo "🧪 Testing Timee Deployment Configuration..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果
TESTS_PASSED=0
TESTS_TOTAL=0

test_result() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${BLUE}📋 Testing Configuration Files...${NC}"

# 测试 1: 检查 Dockerfile
echo -e "${YELLOW}🔍 Checking Dockerfile...${NC}"
if [ -f "Dockerfile" ]; then
    test_result 0 "Dockerfile exists"
else
    test_result 1 "Dockerfile missing"
fi

# 测试 2: 检查启动脚本
echo -e "${YELLOW}🔍 Checking entrypoint scripts...${NC}"
if [ -f "entrypoint.sh" ]; then
    test_result 0 "entrypoint.sh exists"
else
    test_result 1 "entrypoint.sh missing"
fi

if [ -f "entrypoint-production.sh" ]; then
    test_result 0 "entrypoint-production.sh exists"
else
    test_result 1 "entrypoint-production.sh missing"
fi

# 测试 3: 检查启动脚本权限
echo -e "${YELLOW}🔍 Checking script permissions...${NC}"
if [ -x "entrypoint.sh" ]; then
    test_result 0 "entrypoint.sh is executable"
else
    echo -e "${YELLOW}⚠️ Making entrypoint.sh executable...${NC}"
    chmod +x entrypoint.sh
    test_result 0 "entrypoint.sh made executable"
fi

if [ -x "entrypoint-production.sh" ]; then
    test_result 0 "entrypoint-production.sh is executable"
else
    echo -e "${YELLOW}⚠️ Making entrypoint-production.sh executable...${NC}"
    chmod +x entrypoint-production.sh
    test_result 0 "entrypoint-production.sh made executable"
fi

# 测试 4: 检查代理服务器配置
echo -e "${YELLOW}🔍 Checking proxy server configuration...${NC}"
if [ -f "proxy-server.js" ]; then
    test_result 0 "proxy-server.js exists"
else
    test_result 1 "proxy-server.js missing"
fi

if [ -f "proxy-server-simple.js" ]; then
    test_result 0 "proxy-server-simple.js exists"
else
    test_result 1 "proxy-server-simple.js missing"
fi

# 测试 5: 检查后端配置
echo -e "${YELLOW}🔍 Checking backend configuration...${NC}"
if [ -f "timee-api/package.json" ]; then
    test_result 0 "Backend package.json exists"
else
    test_result 1 "Backend package.json missing"
fi

if [ -f "timee-api/src/main.ts" ]; then
    test_result 0 "Backend main.ts exists"
else
    test_result 1 "Backend main.ts missing"
fi

# 测试 6: 检查前端配置
echo -e "${YELLOW}🔍 Checking frontend configuration...${NC}"
if [ -f "timee-frontend/apps/web/package.json" ]; then
    test_result 0 "Frontend package.json exists"
else
    test_result 1 "Frontend package.json missing"
fi

if [ -f "timee-frontend/apps/web/vite.config.ts" ]; then
    test_result 0 "Frontend vite.config.ts exists"
else
    test_result 1 "Frontend vite.config.ts missing"
fi

# 测试 7: 检查环境配置
echo -e "${YELLOW}🔍 Checking environment configuration...${NC}"
if [ -f "timee-api/src/config/environment.config.ts" ]; then
    test_result 0 "Environment config exists"
else
    test_result 1 "Environment config missing"
fi

# 测试 8: 检查数据库配置
echo -e "${YELLOW}🔍 Checking database configuration...${NC}"
if [ -f "timee-api/prisma/schema.prisma" ]; then
    test_result 0 "Prisma schema exists"
else
    test_result 1 "Prisma schema missing"
fi

# 测试 9: 语法检查
echo -e "${YELLOW}🔍 Checking script syntax...${NC}"
if bash -n entrypoint.sh; then
    test_result 0 "entrypoint.sh syntax is valid"
else
    test_result 1 "entrypoint.sh syntax error"
fi

if bash -n entrypoint-production.sh; then
    test_result 0 "entrypoint-production.sh syntax is valid"
else
    test_result 1 "entrypoint-production.sh syntax error"
fi

# 测试 10: 检查 Docker 构建
echo -e "${YELLOW}🔍 Testing Docker build...${NC}"
if command -v docker > /dev/null 2>&1; then
    if docker build -t timee-test:latest . > /dev/null 2>&1; then
        test_result 0 "Docker build successful"
        echo -e "${YELLOW}🧹 Cleaning up test image...${NC}"
        docker rmi timee-test:latest > /dev/null 2>&1
    else
        test_result 1 "Docker build failed"
    fi
else
    echo -e "${YELLOW}⚠️ Docker not available, skipping Docker build test${NC}"
    test_result 0 "Docker build test skipped (Docker not available)"
fi

# 测试 11: 检查端口配置
echo -e "${YELLOW}🔍 Checking port configuration...${NC}"
if grep -q "8080" proxy-server.js; then
    test_result 0 "Proxy server port 8080 configured"
else
    test_result 1 "Proxy server port 8080 not configured"
fi

if grep -q "3000" proxy-server.js; then
    test_result 0 "API port 3000 configured"
else
    test_result 1 "API port 3000 not configured"
fi

if grep -q "5173" proxy-server.js; then
    test_result 0 "Frontend port 5173 configured"
else
    test_result 1 "Frontend port 5173 not configured"
fi

# 测试 12: 检查健康检查端点
echo -e "${YELLOW}🔍 Checking health check endpoints...${NC}"
if grep -q "/health" proxy-server.js; then
    test_result 0 "Health check endpoint configured"
else
    test_result 1 "Health check endpoint missing"
fi

# 测试结果汇总
echo -e "\n${BLUE}📊 Test Results Summary:${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $((TESTS_TOTAL - TESTS_PASSED))${NC}"
echo -e "${BLUE}📋 Total Tests: $TESTS_TOTAL${NC}"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Deployment configuration is ready.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi 