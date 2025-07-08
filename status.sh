#!/bin/bash
# 状态检查脚本

echo "📊 Timee Application Status"
echo "=========================="

# 检查进程
echo "🔍 Running Processes:"
ps aux | grep -E "(node|npm)" | grep -v grep | grep -E "(timee|proxy)" | while read line; do
    echo "   $line"
done

echo ""

# 检查端口
echo "🔌 Port Status:"
netstat -tlnp 2>/dev/null | grep -E ":3000|:5173|:8080" | while read line; do
    echo "   $line"
done

echo ""

# 检查健康状态
echo "🩺 Health Check:"
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "   ✅ Application is healthy"
    echo "   🌐 External URL: https://wmxkwzbmhflj.sealoshzh.site"
else
    echo "   ❌ Application is not responding"
fi

echo ""

# 显示最近的日志
echo "📝 Recent Logs:"
if [ -f "logs/auto-start.log" ]; then
    echo "   Auto-start log (last 5 lines):"
    tail -5 logs/auto-start.log | sed 's/^/      /'
fi

if [ -f "logs/startup.log" ]; then
    echo "   Startup log (last 5 lines):"
    tail -5 logs/startup.log | sed 's/^/      /'
fi
