#!/bin/bash

# 🚀 Timee 项目快速部署到 Sealos 脚本
# 确保你已经在 Sealos 控制台中设置了 kubectl

set -e

echo "🚀 开始部署 Timee 项目到 Sealos..."

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未找到！"
    echo "请在 Sealos 控制台中打开终端，然后运行这个脚本。"
    exit 1
fi

# 1. 创建命名空间
echo "🏗️  创建命名空间..."
kubectl apply -f sealos-namespace.yaml

# 2. 部署后端 API
echo "🔧 部署后端 API..."
kubectl apply -f sealos-backend.yaml

# 3. 部署前端应用
echo "🎨 部署前端应用..."
kubectl apply -f sealos-frontend.yaml

# 4. 配置 Ingress（域名和 SSL）
echo "🌐 配置域名和 SSL..."
kubectl apply -f sealos-ingress.yaml

# 5. 等待部署完成
echo "⏳ 等待应用启动..."
echo "正在等待后端 API 准备就绪..."
kubectl wait --for=condition=available --timeout=300s deployment/timee-api -n timee-production

echo "正在等待前端应用准备就绪..."
kubectl wait --for=condition=available --timeout=300s deployment/timee-frontend -n timee-production

# 6. 显示部署状态
echo ""
echo "📊 部署状态："
kubectl get pods -n timee-production
echo ""
kubectl get services -n timee-production
echo ""
kubectl get ingress -n timee-production

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 访问信息："
echo "   🌐 网站地址: https://timee.group"
echo "   🔧 API 地址: https://timee.group/api"
echo "   ❤️  健康检查: https://timee.group/api/health"
echo ""
echo "⚠️  注意："
echo "   1. 请确保域名 timee.group 的 DNS 记录已指向 Sealos 集群"
echo "   2. SSL 证书将自动申请，可能需要几分钟时间"
echo "   3. 如果访问出现问题，请检查 DNS 解析和证书状态"
echo ""
echo "🔍 有用的命令："
echo "   查看 Pod 状态: kubectl get pods -n timee-production"
echo "   查看 API 日志: kubectl logs -f deployment/timee-api -n timee-production"
echo "   查看前端日志: kubectl logs -f deployment/timee-frontend -n timee-production"
echo ""
echo "✅ 部署脚本执行完成！" 