#!/bin/bash
# 健康检查脚本

echo "🩺 Checking Timee application health..."

# 检查服务状态
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
    echo "🌐 External URL: https://wmxkwzbmhflj.sealoshzh.site"
    
    # 显示服务详情
    echo "📊 Service Status:"
    ps aux | grep -E "(node|npm)" | grep -v grep | grep -E "(timee|proxy)" | while read line; do
        echo "   $line"
    done
    
    exit 0
else
    echo "❌ Application is not healthy"
    echo "🔧 Attempting to restart..."
    ./quick-start.sh
    exit 1
fi
