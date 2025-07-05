#!/bin/bash

# Timee 域名配置辅助脚本

set -e

DOMAIN="timee.group"
WWW_DOMAIN="www.timee.group"

echo "🌐 Timee 域名配置助手"
echo "===================="
echo ""

# 检查 kubectl 连接
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "❌ 无法连接到 Kubernetes 集群，请检查 kubectl 配置"
    exit 1
fi

echo "✅ 已连接到 Kubernetes 集群"

# 获取 Ingress 外部 IP
echo "🔍 获取 Sealos Ingress IP 地址..."

# 尝试获取 LoadBalancer 类型的 Ingress Controller 服务
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -z "$INGRESS_IP" ]; then
    # 如果没有 LoadBalancer IP，尝试获取外部 IP
    INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.spec.externalIPs[0]}' 2>/dev/null || echo "")
fi

if [ -z "$INGRESS_IP" ]; then
    # 如果还是没有，获取任意节点的外部 IP
    INGRESS_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null || echo "")
fi

if [ -z "$INGRESS_IP" ]; then
    echo "⚠️  无法自动获取 Ingress IP 地址"
    echo "请手动获取 Sealos 集群的入口 IP 地址："
    echo ""
    echo "方法 1 - 查看 Ingress Controller 服务："
    echo "kubectl get svc -n ingress-nginx"
    echo ""
    echo "方法 2 - 查看节点外部 IP："
    echo "kubectl get nodes -o wide"
    echo ""
    echo "方法 3 - 联系 Sealos 平台获取入口 IP"
    echo ""
    read -p "请输入 Sealos 集群的入口 IP 地址: " INGRESS_IP
fi

echo "📍 Sealos Ingress IP: $INGRESS_IP"
echo ""

# 生成 DNS 配置说明
echo "📋 DNS 配置说明"
echo "================="
echo ""
echo "请在您的域名服务商（如阿里云）配置以下 A 记录："
echo ""
echo "记录类型    主机记录         记录值"
echo "========    ============    ==============="
echo "A           @               $INGRESS_IP"
echo "A           www             $INGRESS_IP"
echo ""

# 检查当前 DNS 解析
echo "🔍 检查当前 DNS 解析状态..."
echo ""

check_dns() {
    local domain=$1
    local expected_ip=$2
    
    echo -n "检查 $domain ... "
    
    # 使用多个 DNS 服务器进行查询
    current_ip=$(nslookup $domain 8.8.8.8 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    
    if [ -z "$current_ip" ]; then
        echo "❌ 无 DNS 记录"
        return 1
    elif [ "$current_ip" = "$expected_ip" ]; then
        echo "✅ 解析正确 ($current_ip)"
        return 0
    else
        echo "⚠️  解析不匹配 (当前: $current_ip, 期望: $expected_ip)"
        return 1
    fi
}

# 检查主域名和 www 域名
check_dns "$DOMAIN" "$INGRESS_IP"
check_dns "$WWW_DOMAIN" "$INGRESS_IP"

echo ""

# SSL 证书状态检查
echo "🔒 检查 SSL 证书状态..."
echo ""

if kubectl get certificate timee-tls-cert -n timee-production >/dev/null 2>&1; then
    cert_status=$(kubectl get certificate timee-tls-cert -n timee-production -o jsonpath='{.status.conditions[0].type}' 2>/dev/null || echo "Unknown")
    
    if [ "$cert_status" = "Ready" ]; then
        echo "✅ SSL 证书已就绪"
    else
        echo "⏳ SSL 证书申请中..."
        echo "   状态: $cert_status"
        echo "   这个过程可能需要几分钟时间"
    fi
else
    echo "❌ 未找到 SSL 证书配置"
    echo "   请确保已部署 Ingress 配置"
fi

echo ""

# 生成测试命令
echo "🧪 测试命令"
echo "==========="
echo ""
echo "DNS 解析测试："
echo "nslookup $DOMAIN"
echo "nslookup $WWW_DOMAIN"
echo ""
echo "网站访问测试："
echo "curl -I https://$DOMAIN"
echo "curl -I https://$DOMAIN/api/health"
echo ""
echo "SSL 证书测试："
echo "openssl s_client -connect $DOMAIN:443 -servername $DOMAIN"
echo ""

# 部署状态检查
echo "📊 当前部署状态"
echo "================"
echo ""

if kubectl get namespace timee-production >/dev/null 2>&1; then
    echo "命名空间状态："
    kubectl get pods -n timee-production 2>/dev/null || echo "  无 Pod 运行"
    
    echo ""
    echo "服务状态："
    kubectl get svc -n timee-production 2>/dev/null || echo "  无服务配置"
    
    echo ""
    echo "Ingress 状态："
    kubectl get ingress -n timee-production 2>/dev/null || echo "  无 Ingress 配置"
else
    echo "❌ 生产环境命名空间不存在"
    echo "   请先运行部署脚本：./build-and-deploy.sh"
fi

echo ""
echo "🎯 下一步操作建议"
echo "=================="
echo ""

# 根据当前状态给出建议
if kubectl get pods -n timee-production >/dev/null 2>&1; then
    pod_count=$(kubectl get pods -n timee-production --no-headers 2>/dev/null | wc -l)
    running_pods=$(kubectl get pods -n timee-production --no-headers 2>/dev/null | grep -c "Running" || echo "0")
    
    if [ "$running_pods" -gt 0 ]; then
        echo "✅ 应用已部署并运行中"
        echo ""
        echo "请完成以下步骤："
        echo "1. 配置 DNS A 记录（如上所示）"
        echo "2. 等待 DNS 解析生效（通常 5-30 分钟）"
        echo "3. 等待 SSL 证书自动申请完成"
        echo "4. 访问 https://$DOMAIN 验证部署"
    else
        echo "⚠️  应用 Pod 未正常运行"
        echo ""
        echo "建议操作："
        echo "1. 检查 Pod 状态：kubectl get pods -n timee-production"
        echo "2. 查看 Pod 日志：kubectl logs -n timee-production [pod-name]"
        echo "3. 检查资源配额和节点资源"
    fi
else
    echo "❌ 应用尚未部署"
    echo ""
    echo "请执行部署："
    echo "1. 配置镜像仓库地址"
    echo "2. 运行：./build-and-deploy.sh [your-registry] [tag]"
    echo "3. 配置域名 DNS 解析"
fi

echo ""
echo "📞 获取支持"
echo "==========="
echo "如果遇到问题，请："
echo "1. 查看部署指南：cat SEALOS_DEPLOYMENT_GUIDE.md"
echo "2. 检查 Sealos 平台状态"
echo "3. 联系 Sealos 技术支持"
echo ""
echo "🎉 祝您部署顺利！" 