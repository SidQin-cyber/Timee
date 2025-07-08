#!/bin/bash

# 测试API功能的脚本
echo "=== 热力图应用API功能测试 ==="
echo "测试时间: $(date)"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_field="$5"
    
    echo -e "${BLUE}测试: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    else
        response=$(curl -s -X "$method" "$url")
    fi
    
    echo "响应: $response"
    
    # 检查响应是否包含success字段且为true
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ 测试通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 测试失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo
}

# 开始测试
echo -e "${YELLOW}开始API功能测试...${NC}"
echo

# 1. 测试健康检查
test_api "Events健康检查" "GET" "http://localhost:3000/api/events/health"
test_api "Responses健康检查" "GET" "http://localhost:3000/api/responses/health"

# 2. 测试tcCode生成
test_api "生成tcCode" "GET" "http://localhost:3000/api/events/generate/tc-code"

# 3. 测试活动创建
GENERATED_CODE=$(curl -s -X GET "http://localhost:3000/api/events/generate/tc-code" | grep -o '"tcCode":"[^"]*"' | cut -d'"' -f4)
echo -e "${BLUE}生成的测试代码: $GENERATED_CODE${NC}"

if [ -n "$GENERATED_CODE" ]; then
    EVENT_DATA="{\"tcCode\":\"$GENERATED_CODE\",\"title\":\"测试活动\",\"description\":\"API测试活动\",\"startDate\":\"2024-01-01T00:00:00.000Z\",\"endDate\":\"2024-01-02T00:00:00.000Z\",\"timezone\":\"UTC\"}"
    test_api "创建活动" "POST" "http://localhost:3000/api/events" "$EVENT_DATA"
    
    # 4. 测试活动查询
    test_api "查询活动" "GET" "http://localhost:3000/api/events/tc/$GENERATED_CODE"
    
    # 5. 获取活动ID用于后续测试
    EVENT_ID=$(curl -s -X GET "http://localhost:3000/api/events/tc/$GENERATED_CODE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${BLUE}活动ID: $EVENT_ID${NC}"
    
    if [ -n "$EVENT_ID" ]; then
        # 6. 测试响应创建
        RESPONSE_DATA="{\"eventId\":\"$EVENT_ID\",\"participantName\":\"测试用户\",\"availability\":[{\"day\":0,\"hour\":0,\"available\":true},{\"day\":1,\"hour\":1,\"available\":true}],\"paintMode\":\"available\"}"
        test_api "创建响应" "POST" "http://localhost:3000/api/responses" "$RESPONSE_DATA"
        
        # 7. 测试房间数据获取
        test_api "获取房间数据" "GET" "http://localhost:3000/api/responses/room/$EVENT_ID"
        
        # 8. 测试用户响应获取
        test_api "获取用户响应" "GET" "http://localhost:3000/api/responses/user/$EVENT_ID/测试用户"
    else
        echo -e "${RED}无法获取活动ID，跳过响应相关测试${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 4))
        TOTAL_TESTS=$((TOTAL_TESTS + 4))
    fi
else
    echo -e "${RED}无法生成测试代码，跳过活动相关测试${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 6))
    TOTAL_TESTS=$((TOTAL_TESTS + 6))
fi

# 测试结果统计
echo "================================="
echo -e "${YELLOW}测试结果统计:${NC}"
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！API功能正常！${NC}"
    exit 0
else
    echo -e "${RED}⚠️ 部分测试失败，请检查API服务状态${NC}"
    exit 1
fi 