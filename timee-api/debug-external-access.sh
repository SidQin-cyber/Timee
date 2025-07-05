#!/bin/bash

echo "🔍 Timee API 外部访问诊断工具"
echo "=================================="
echo

# 1. 检查本地API状态
echo "1️⃣ 检查本地API状态..."
LOCAL_API=$(curl -s "http://localhost:8080/api/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ 本地API运行正常"
    echo "   响应: $LOCAL_API"
else
    echo "❌ 本地API无法访问"
    echo "   请检查API服务是否启动"
fi
echo

# 2. 检查外部URL状态
echo "2️⃣ 检查外部URL状态..."
EXTERNAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/" 2>/dev/null)
echo "   外部URL响应码: $EXTERNAL_RESPONSE"

if [ "$EXTERNAL_RESPONSE" = "404" ]; then
    echo "❌ 外部URL返回404 - 代理应用可能未正确配置"
elif [ "$EXTERNAL_RESPONSE" = "000" ]; then
    echo "❌ 外部URL无法连接 - 网络或DNS问题"
elif [ "$EXTERNAL_RESPONSE" = "200" ]; then
    echo "✅ 外部URL可访问"
else
    echo "⚠️  外部URL返回: $EXTERNAL_RESPONSE"
fi
echo

# 3. 检查API端点
echo "3️⃣ 检查API端点..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/api/health" 2>/dev/null)
echo "   API端点响应码: $API_RESPONSE"

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API端点工作正常"
    API_DATA=$(curl -s "http://wmxkwzbmhlj.sealoshzh.site/api/health" 2>/dev/null)
    echo "   响应: $API_DATA"
else
    echo "❌ API端点无法访问"
fi
echo

# 4. 网络连通性测试
echo "4️⃣ 网络连通性测试..."
ping -c 1 wmxkwzbmhlj.sealoshzh.site >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 域名解析正常"
else
    echo "❌ 域名解析失败"
fi
echo

# 5. 端口检查
echo "5️⃣ 端口检查..."
if command -v nc >/dev/null 2>&1; then
    nc -z wmxkwzbmhlj.sealoshzh.site 80 >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ 端口80可访问"
    else
        echo "❌ 端口80无法访问"
    fi
else
    echo "⚠️  nc命令不可用，跳过端口检查"
fi
echo

# 6. 建议解决方案
echo "🚀 建议解决方案:"
echo "=================================="

if [ "$EXTERNAL_RESPONSE" = "404" ]; then
    echo "问题：代理应用配置错误"
    echo
    echo "方案1: 使用socat创建简单代理"
    echo "   镜像: alpine/socat"
    echo "   命令: socat TCP-LISTEN:80,fork TCP:devbox-timee.ns-upg0e2qv.svc.cluster.local:8080"
    echo
    echo "方案2: 检查hello-world应用日志"
    echo "   在Sealos中查看应用日志，找出启动错误"
    echo
    echo "方案3: 简化nginx配置"
    echo "   使用更简单的nginx配置命令"
fi

if [ "$EXTERNAL_RESPONSE" = "000" ]; then
    echo "问题：网络连接问题"
    echo
    echo "方案1: 检查域名配置"
    echo "   确认域名在Sealos中正确配置"
    echo
    echo "方案2: 检查应用状态"
    echo "   确认代理应用正在运行"
fi

if [ "$LOCAL_API" = "" ]; then
    echo "问题：本地API未运行"
    echo
    echo "解决: 启动API服务"
    echo "   cd /home/devbox/project/timee-api"
    echo "   npm run start:dev"
fi

echo
echo "🔧 立即尝试的命令:"
echo "cd /home/devbox/project/timee-api && chmod +x debug-external-access.sh && ./debug-external-access.sh" 