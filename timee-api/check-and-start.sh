#!/bin/bash

echo "🔍 Timee API 服务状态检查..."
echo "=================================="

# 检查服务是否运行
if pgrep -f "node.*dist/main" > /dev/null; then
    echo "✅ API服务正在运行"
    API_PID=$(pgrep -f "node.*dist/main")
    echo "   进程ID: $API_PID"
else
    echo "❌ API服务未运行，正在启动..."
    cd /home/devbox/project/timee-api
    nohup npm run start:dev > /tmp/timee-api.log 2>&1 &
    sleep 3
    if pgrep -f "node.*dist/main" > /dev/null; then
        echo "✅ API服务启动成功"
    else
        echo "❌ API服务启动失败，请检查日志: /tmp/timee-api.log"
        exit 1
    fi
fi

echo ""
echo "🌐 网络连接测试..."
echo "=================================="

# 检查本地连接
if curl -s http://localhost:8080/api/health > /dev/null; then
    echo "✅ 本地API连接正常: http://localhost:8080/api"
else
    echo "❌ 本地API连接失败"
    exit 1
fi

# 检查外部连接
echo "🔗 测试外部访问..."
if curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/api" | grep -q "200"; then
    echo "✅ 外部访问正常: http://wmxkwzbmhlj.sealoshzh.site/api"
else
    echo "❌ 外部访问失败 (HTTP状态码: $(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/api"))"
    echo ""
    echo "🛠️  需要配置Sealos端口映射："
    echo "=================================="
    echo "1. 访问 Sealos 控制台: https://cloud.sealos.io"
    echo "2. 进入 DevBox 管理页面"
    echo "3. 找到 'devbox-timee' 实例"
    echo "4. 点击 '设置' 或 '网络配置'"
    echo "5. 添加端口映射:"
    echo "   - 内部端口: 8080"
    echo "   - 外部端口: 8080"
    echo "   - 协议: HTTP"
    echo "6. 保存配置并重启实例"
    echo ""
    echo "📝 详细说明请查看: SEALOS_NETWORK_SETUP.md"
fi

echo ""
echo "📊 当前状态摘要..."
echo "=================================="
echo "本地API: http://localhost:8080/api ✅"
echo "外部API: http://wmxkwzbmhlj.sealoshzh.site/api $(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/api" | grep -q "200" && echo "✅" || echo "❌")"
echo "数据库: $(curl -s http://localhost:8080/api/events > /dev/null && echo "✅ 连接正常" || echo "❌ 连接失败")"

echo ""
echo "🚀 API服务已准备就绪！"
echo "如需前端开发，请使用: http://localhost:8080/api"
echo "如需外部访问，请按上述说明配置Sealos端口映射。" 