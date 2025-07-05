#!/bin/bash

echo "🔍 测试 Timee 服务状态..."
echo ""

# 测试代理服务器
echo "📡 测试代理服务器 (端口 8080)..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ 代理服务器响应正常"
else
    echo "❌ 代理服务器无响应"
fi

# 测试前端
echo "🎨 测试前端服务 (端口 5173)..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服务响应正常"
else
    echo "❌ 前端服务无响应"
fi

# 测试后端API
echo "🔧 测试后端API (端口 3000)..."
API_RESPONSE=$(curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ] && [[ $API_RESPONSE == *"OK"* ]]; then
    echo "✅ 后端API响应正常"
    echo "   响应: $API_RESPONSE"
else
    echo "❌ 后端API无响应或错误"
fi

# 测试API代理
echo "🔀 测试API代理 (8080 -> 3000)..."
PROXY_API_RESPONSE=$(curl -s http://localhost:8080/api/health)
if [ $? -eq 0 ] && [[ $PROXY_API_RESPONSE == *"OK"* ]]; then
    echo "✅ API代理工作正常"
else
    echo "❌ API代理出现问题"
fi

echo ""
echo "📊 端口监听状态:"
netstat -tlnp | grep ":8080\|:3000\|:5173" | while read line; do
    echo "   $line"
done

echo ""
echo "🔄 进程状态:"
ps aux | grep -E "node|npm" | grep -v grep | grep -v cursor | while read line; do
    echo "   $line"
done

echo ""
echo "🌐 访问地址:"
echo "   - 外部访问: http://wmxkwzbmhlj.sealoshzh.site"
echo "   - 本地访问: http://localhost:8080" 