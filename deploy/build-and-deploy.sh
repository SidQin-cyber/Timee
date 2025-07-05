#!/bin/bash

# Timee 项目 Sealos 部署脚本
# 使用方法: ./build-and-deploy.sh [registry] [tag]

set -e

# 配置
REGISTRY=${1:-"registry.cn-hangzhou.aliyuncs.com/your-namespace"}
TAG=${2:-"latest"}
BACKEND_IMAGE="${REGISTRY}/timee-api:${TAG}"
FRONTEND_IMAGE="${REGISTRY}/timee-frontend:${TAG}"

echo "🚀 开始构建和部署 Timee 项目到 Sealos"
echo "📊 配置信息:"
echo "   Registry: ${REGISTRY}"
echo "   Tag: ${TAG}"
echo "   Backend Image: ${BACKEND_IMAGE}"
echo "   Frontend Image: ${FRONTEND_IMAGE}"
echo ""

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未安装，请先安装 kubectl"
    exit 1
fi

# 构建后端镜像
echo "🔨 构建后端镜像..."
cd ../timee-api
docker build -t "${BACKEND_IMAGE}" .
echo "✅ 后端镜像构建完成: ${BACKEND_IMAGE}"

# 构建前端镜像
echo "🔨 构建前端镜像..."
cd ../timee-frontend
docker build -t "${FRONTEND_IMAGE}" .
echo "✅ 前端镜像构建完成: ${FRONTEND_IMAGE}"

# 推送镜像到仓库
echo "📤 推送镜像到仓库..."
docker push "${BACKEND_IMAGE}"
docker push "${FRONTEND_IMAGE}"
echo "✅ 镜像推送完成"

# 回到部署目录
cd ../deploy

# 更新部署文件中的镜像地址
echo "📝 更新部署配置..."
sed -i.bak "s|your-registry/timee-api:latest|${BACKEND_IMAGE}|g" sealos-backend.yaml
sed -i.bak "s|your-registry/timee-frontend:latest|${FRONTEND_IMAGE}|g" sealos-frontend.yaml

# 创建命名空间
echo "🏗️  创建命名空间..."
kubectl apply -f sealos-namespace.yaml
echo "✅ 命名空间创建完成"

# 部署后端
echo "🚀 部署后端服务..."
kubectl apply -f sealos-backend.yaml
echo "✅ 后端服务部署完成"

# 部署前端
echo "🚀 部署前端服务..."
kubectl apply -f sealos-frontend.yaml
echo "✅ 前端服务部署完成"

# 部署 Ingress
echo "🌐 配置 Ingress..."
kubectl apply -f sealos-ingress.yaml
echo "✅ Ingress 配置完成"

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl wait --for=condition=available --timeout=300s deployment/timee-api -n timee-production
kubectl wait --for=condition=available --timeout=300s deployment/timee-frontend -n timee-production

# 检查部署状态
echo "📊 检查部署状态..."
kubectl get pods -n timee-production
kubectl get services -n timee-production
kubectl get ingress -n timee-production

# 显示访问信息
echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 访问信息:"
echo "   网站地址: https://timee.group"
echo "   API 地址: https://timee.group/api"
echo "   健康检查: https://timee.group/api/health"
echo ""
echo "🔍 监控命令:"
echo "   查看 Pod 状态: kubectl get pods -n timee-production"
echo "   查看服务日志: kubectl logs -f deployment/timee-api -n timee-production"
echo "   查看前端日志: kubectl logs -f deployment/timee-frontend -n timee-production"
echo ""
echo "⚠️  注意事项:"
echo "   1. 请确保域名 timee.group 的 DNS 记录已指向 Sealos 集群"
echo "   2. SSL 证书将自动申请，可能需要几分钟时间"
echo "   3. 如果访问出现问题，请检查 DNS 解析和证书状态"
echo ""

# 恢复部署文件
mv sealos-backend.yaml.bak sealos-backend.yaml 2>/dev/null || true
mv sealos-frontend.yaml.bak sealos-frontend.yaml 2>/dev/null || true

echo "✅ 部署脚本执行完成！" 