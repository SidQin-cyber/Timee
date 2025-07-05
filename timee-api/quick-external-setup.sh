#!/bin/bash

echo "🚀 Timee API 外部访问快速配置"
echo "========================================"

# 检查当前状态
echo "📊 当前状态检查..."
API_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/health")
API_EXTERNAL=$(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/api/health")

echo "本地API (8080): $([ "$API_LOCAL" = "200" ] && echo "✅ 正常" || echo "❌ 失败")"
echo "外部API: $([ "$API_EXTERNAL" = "200" ] && echo "✅ 正常" || echo "❌ 需要配置")"

if [ "$API_EXTERNAL" = "200" ]; then
    echo ""
    echo "🎉 外部访问已经配置成功！"
    echo "前端可以使用: http://wmxkwzbmhlj.sealoshzh.site/api"
    exit 0
fi

echo ""
echo "🔧 需要配置外部访问"
echo "========================================"
echo ""
echo "📋 请按以下步骤操作:"
echo ""
echo "1️⃣  打开 Sealos 控制台"
echo "    URL: https://cloud.sealos.io"
echo ""
echo "2️⃣  进入 DevBox 管理"
echo "    - 点击左侧菜单 'DevBox'"
echo "    - 找到 'devbox-timee' 实例"
echo ""
echo "3️⃣  配置端口映射"
echo "    - 点击实例的 '设置' 或 '网络配置'"
echo "    - 查找 '端口映射' 选项"
echo "    - 添加映射: 内部8080 → 外部8080"
echo "    - 保存配置"
echo ""
echo "4️⃣  重启并测试"
echo "    - 重启 DevBox 实例"
echo "    - 等待启动完成"
echo "    - 运行此脚本验证: ./quick-external-setup.sh"
echo ""
echo "📝 配置详细信息:"
echo "    内部端口: 8080"
echo "    外部端口: 8080 (或自动分配)"
echo "    协议: HTTP"
echo "    目标: 让 http://wmxkwzbmhlj.sealoshzh.site/api 可访问"
echo ""
echo "🆘 如果有问题，请查看: DEPLOY_EXTERNAL_ACCESS.md"
echo ""
echo "⏳ 配置完成后，前端可以使用以下URL:"
echo "    API地址: http://wmxkwzbmhlj.sealoshzh.site/api"
echo "    健康检查: http://wmxkwzbmhlj.sealoshzh.site/api/health"
echo "    事件列表: http://wmxkwzbmhlj.sealoshzh.site/api/events" 