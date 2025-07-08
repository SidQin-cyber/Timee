#!/bin/bash

# 测试外部域名的所有功能
# 创建时间: 2025-07-05

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="https://wmxkwzbmhflj.sealoshzh.site"

echo -e "${BLUE}🧪 测试外部域名: $DOMAIN${NC}"
echo "========================================================"

# 测试1: 基本连接
echo -e "${YELLOW}1. 测试基本连接...${NC}"
if curl -s -I "$DOMAIN" | head -1 | grep -q "200"; then
    echo -e "${GREEN}✅ 基本连接成功${NC}"
else
    echo -e "${RED}❌ 基本连接失败${NC}"
    exit 1
fi

# 测试2: 前端应用
echo -e "${YELLOW}2. 测试前端应用...${NC}"
if curl -s "$DOMAIN" | grep -q "<!doctype html>"; then
    echo -e "${GREEN}✅ 前端应用正常加载${NC}"
else
    echo -e "${RED}❌ 前端应用加载失败${NC}"
    exit 1
fi

# 测试3: API健康检查
echo -e "${YELLOW}3. 测试API健康检查...${NC}"
API_RESPONSE=$(curl -s "$DOMAIN/api/health")
if echo "$API_RESPONSE" | grep -q '"status":"OK"'; then
    echo -e "${GREEN}✅ API健康检查成功${NC}"
    echo -e "${BLUE}   API响应: $API_RESPONSE${NC}"
else
    echo -e "${RED}❌ API健康检查失败${NC}"
    exit 1
fi

# 测试4: 代理服务器健康检查
echo -e "${YELLOW}4. 测试代理服务器健康检查...${NC}"
PROXY_RESPONSE=$(curl -s "$DOMAIN/health")
if echo "$PROXY_RESPONSE" | grep -q '"status":"OK"'; then
    echo -e "${GREEN}✅ 代理服务器健康检查成功${NC}"
    echo -e "${BLUE}   代理响应: $PROXY_RESPONSE${NC}"
else
    echo -e "${RED}❌ 代理服务器健康检查失败${NC}"
    exit 1
fi

# 测试5: CORS Headers
echo -e "${YELLOW}5. 测试CORS头部...${NC}"
if curl -s -I "$DOMAIN" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS头部正常${NC}"
else
    echo -e "${RED}❌ CORS头部缺失${NC}"
    exit 1
fi

# 测试6: 响应时间
echo -e "${YELLOW}6. 测试响应时间...${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$DOMAIN")
echo -e "${BLUE}   响应时间: ${RESPONSE_TIME}s${NC}"

if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ 响应时间良好${NC}"
else
    echo -e "${YELLOW}⚠️ 响应时间较慢${NC}"
fi

echo "========================================================"
echo -e "${GREEN}🎉 所有测试通过！外部域名功能正常${NC}"
echo ""
echo -e "${BLUE}📋 测试摘要:${NC}"
echo "• 外部域名: $DOMAIN"
echo "• 前端应用: ✅ 正常"
echo "• API接口: ✅ 正常"
echo "• 代理服务器: ✅ 正常"
echo "• CORS配置: ✅ 正常"
echo "• 响应时间: ${RESPONSE_TIME}s"
echo ""
echo -e "${BLUE}🌐 访问地址:${NC}"
echo "• 主页: $DOMAIN"
echo "• API健康检查: $DOMAIN/api/health"
echo "• 代理健康检查: $DOMAIN/health" 