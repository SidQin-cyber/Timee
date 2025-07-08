#!/bin/bash

# Timee 自动启动设置脚本
# 配置容器重启后自动启动应用

echo "🔧 Setting up Timee Auto-Start Configuration..."

# 确保在正确的目录
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo "📂 Project directory: $PROJECT_DIR"

# 创建启动脚本
cat > /tmp/timee-startup.sh << 'EOF'
#!/bin/bash
# Timee 启动脚本 - 由cron调用

# 等待系统完全启动
sleep 30

# 切换到项目目录
cd /home/devbox/project

# 检查服务是否已经运行
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "$(date): Services already running" >> logs/startup.log
    exit 0
fi

# 启动服务
echo "$(date): Starting Timee services..." >> logs/startup.log
./quick-start.sh >> logs/startup.log 2>&1

# 验证启动成功
if curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "$(date): Services started successfully" >> logs/startup.log
else
    echo "$(date): Service startup failed, trying auto-start..." >> logs/startup.log
    ./auto-start.sh >> logs/startup.log 2>&1 &
fi
EOF

# 移动脚本到正确位置并设置权限
sudo mv /tmp/timee-startup.sh /home/devbox/timee-startup.sh
sudo chown devbox:devbox /home/devbox/timee-startup.sh
sudo chmod +x /home/devbox/timee-startup.sh

echo "✅ Startup script created at /home/devbox/timee-startup.sh"

# 创建cron任务
echo "📅 Setting up cron job..."
(crontab -l 2>/dev/null; echo "@reboot /home/devbox/timee-startup.sh") | crontab -

echo "✅ Cron job added for auto-start on reboot"

# 创建systemd用户服务（如果systemd可用）
if command -v systemctl &> /dev/null; then
    echo "🔧 Creating systemd user service..."
    
    mkdir -p ~/.config/systemd/user
    
    cat > ~/.config/systemd/user/timee.service << EOF
[Unit]
Description=Timee Application
After=network.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/quick-start.sh
Restart=always
RestartSec=30
Environment=NODE_ENV=production
StandardOutput=append:$PROJECT_DIR/logs/systemd.log
StandardError=append:$PROJECT_DIR/logs/systemd.log

[Install]
WantedBy=default.target
EOF

    # 重新加载systemd配置
    systemctl --user daemon-reload
    
    # 启用服务
    systemctl --user enable timee.service
    
    echo "✅ Systemd user service created and enabled"
    echo "💡 You can control the service with:"
    echo "   systemctl --user start timee.service"
    echo "   systemctl --user stop timee.service"
    echo "   systemctl --user status timee.service"
fi

# 创建健康检查脚本
cat > check-health.sh << 'EOF'
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
EOF

chmod +x check-health.sh

echo "✅ Health check script created"

# 创建一个简单的状态脚本
cat > status.sh << 'EOF'
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
EOF

chmod +x status.sh

echo "✅ Status script created"

echo ""
echo "🎉 Auto-start setup completed!"
echo ""
echo "📋 Available Commands:"
echo "   ./quick-start.sh    - Start services immediately"
echo "   ./auto-start.sh     - Start with monitoring"
echo "   ./check-health.sh   - Check application health"
echo "   ./status.sh         - Show detailed status"
echo "   ./stop-production.sh - Stop all services"
echo ""
echo "🔄 Auto-start is now configured:"
echo "   ✅ Cron job added for reboot"
if command -v systemctl &> /dev/null; then
    echo "   ✅ Systemd user service enabled"
fi
echo ""
echo "💡 To test the setup, you can:"
echo "   1. Run ./stop-production.sh to stop services"
echo "   2. Run ./check-health.sh to verify and restart"
echo "   3. Check ./status.sh for detailed information" 