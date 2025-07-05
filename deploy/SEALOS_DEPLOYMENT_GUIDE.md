# 🚀 Timee 项目 Sealos 部署完整指南

## 📋 目录
1. [部署前准备](#部署前准备)
2. [环境配置](#环境配置)
3. [构建镜像](#构建镜像)
4. [部署到 Sealos](#部署到-sealos)
5. [域名配置](#域名配置)
6. [SSL 证书配置](#ssl-证书配置)
7. [监控和维护](#监控和维护)
8. [故障排除](#故障排除)

## 🎯 部署前准备

### 1. 必要工具
确保您的开发环境已安装以下工具：

```bash
# Docker
docker --version

# kubectl (Kubernetes 命令行工具)
kubectl version --client

# 可选：Helm (如果需要)
helm version
```

### 2. Sealos 访问配置
- 确保您有 Sealos 平台的访问权限
- 配置 kubectl 连接到您的 Sealos 集群
- 确认您有创建命名空间和部署应用的权限

### 3. 容器镜像仓库
选择一个容器镜像仓库，推荐：
- **阿里云容器镜像服务 (ACR)**：`registry.cn-hangzhou.aliyuncs.com/your-namespace`
- **Docker Hub**：`your-username`
- **Harbor 私有仓库**：`your-harbor-url/your-project`

## 🔧 环境配置

### 1. 更新数据库连接
编辑 `deploy/sealos-backend.yaml`，更新数据库连接字符串：

```bash
# 获取当前数据库连接字符串的 base64 编码
echo -n "postgresql://postgres:your-password@your-db-host:5432/postgres" | base64
```

将结果更新到 `sealos-backend.yaml` 的 `database-url` 字段。

### 2. 配置 JWT 密钥
生成并配置 JWT 密钥：

```bash
# 生成随机密钥
openssl rand -base64 32

# 进行 base64 编码
echo -n "your-jwt-secret-key" | base64
```

### 3. 域名配置
确认您的域名配置：
- 主域名：`timee.group`
- www 域名：`www.timee.group`
- API 子域名（可选）：`api.timee.group`

## 🏗️ 构建镜像

### 方法 1：使用自动化脚本（推荐）

```bash
# 进入部署目录
cd deploy

# 给脚本执行权限
chmod +x build-and-deploy.sh

# 执行部署（替换为您的镜像仓库地址）
./build-and-deploy.sh registry.cn-hangzhou.aliyuncs.com/your-namespace latest
```

### 方法 2：手动构建

```bash
# 构建后端镜像
cd timee-api
docker build -t your-registry/timee-api:latest .
docker push your-registry/timee-api:latest

# 构建前端镜像
cd ../timee-frontend
docker build -t your-registry/timee-frontend:latest .
docker push your-registry/timee-frontend:latest
```

## 🚀 部署到 Sealos

### 1. 连接到 Sealos 集群
```bash
# 确认连接正常
kubectl cluster-info

# 查看当前命名空间
kubectl get namespaces
```

### 2. 创建部署资源
```bash
cd deploy

# 1. 创建命名空间和基础配置
kubectl apply -f sealos-namespace.yaml

# 2. 部署后端服务
kubectl apply -f sealos-backend.yaml

# 3. 部署前端服务
kubectl apply -f sealos-frontend.yaml

# 4. 配置 Ingress 和 SSL
kubectl apply -f sealos-ingress.yaml
```

### 3. 检查部署状态
```bash
# 查看 Pod 状态
kubectl get pods -n timee-production

# 查看服务状态
kubectl get services -n timee-production

# 查看 Ingress 状态
kubectl get ingress -n timee-production

# 查看证书状态
kubectl get certificates -n timee-production
```

## 🌐 域名配置

### 1. DNS 解析配置
将您的域名解析到 Sealos 集群的 Ingress IP：

```bash
# 获取 Ingress 外部 IP
kubectl get ingress timee-main-ingress -n timee-production

# 配置 DNS A 记录
timee.group          A    [Sealos-Ingress-IP]
www.timee.group      A    [Sealos-Ingress-IP]
```

### 2. DNS 解析验证
```bash
# 验证 DNS 解析
nslookup timee.group
nslookup www.timee.group

# 或使用 dig
dig timee.group
dig www.timee.group
```

## 🔒 SSL 证书配置

### 1. 自动证书申请
证书将通过 cert-manager 自动申请：

```bash
# 检查证书申请状态
kubectl describe certificate timee-tls-cert -n timee-production

# 查看证书申请过程
kubectl get certificaterequests -n timee-production
```

### 2. 手动证书配置（如果自动申请失败）
```bash
# 创建 TLS 密钥
kubectl create secret tls timee-tls-cert \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n timee-production
```

## 📊 监控和维护

### 1. 实时监控
```bash
# 查看实时日志
kubectl logs -f deployment/timee-api -n timee-production
kubectl logs -f deployment/timee-frontend -n timee-production

# 监控资源使用
kubectl top pods -n timee-production
kubectl top nodes
```

### 2. 健康检查
```bash
# 检查应用健康状态
curl -k https://timee.group/health
curl -k https://timee.group/api/health

# 检查 WebSocket 连接
curl -k -H "Upgrade: websocket" -H "Connection: Upgrade" https://timee.group/socket.io/
```

### 3. 扩容和更新
```bash
# 扩容后端服务
kubectl scale deployment timee-api --replicas=3 -n timee-production

# 滚动更新
kubectl set image deployment/timee-api api=your-registry/timee-api:v2.0 -n timee-production

# 查看更新状态
kubectl rollout status deployment/timee-api -n timee-production
```

## 🔧 故障排除

### 1. Pod 启动失败
```bash
# 查看 Pod 详细信息
kubectl describe pod [pod-name] -n timee-production

# 查看 Pod 日志
kubectl logs [pod-name] -n timee-production --previous
```

### 2. 服务无法访问
```bash
# 检查服务配置
kubectl get svc -n timee-production

# 检查端点
kubectl get endpoints -n timee-production

# 测试服务内部连接
kubectl run test-pod --image=curlimages/curl -it --rm -- sh
# 在 Pod 内测试：curl timee-api:3000/api/health
```

### 3. SSL 证书问题
```bash
# 检查证书状态
kubectl describe certificate timee-tls-cert -n timee-production

# 查看 cert-manager 日志
kubectl logs -n cert-manager deployment/cert-manager

# 手动触发证书更新
kubectl delete certificate timee-tls-cert -n timee-production
kubectl apply -f sealos-ingress.yaml
```

### 4. DNS 解析问题
```bash
# 测试域名解析
nslookup timee.group 8.8.8.8

# 检查 Ingress 配置
kubectl describe ingress timee-main-ingress -n timee-production

# 查看 Nginx Ingress 日志
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## 📱 生产环境检查清单

### 部署前
- [ ] 域名已购买并完成 ICP 备案
- [ ] 容器镜像仓库已配置
- [ ] 数据库已准备就绪
- [ ] kubectl 已配置并能访问 Sealos 集群
- [ ] 环境变量已正确配置

### 部署后
- [ ] 所有 Pod 状态为 Running
- [ ] 服务健康检查通过
- [ ] 域名可以正常访问
- [ ] SSL 证书已正确配置
- [ ] API 接口功能正常
- [ ] WebSocket 连接正常
- [ ] 前端应用加载正常

### 监控设置
- [ ] 日志监控已配置
- [ ] 性能监控已设置
- [ ] 错误告警已启用
- [ ] 备份策略已实施

## 🆘 获取帮助

如果遇到问题，可以：

1. **查看日志**：`kubectl logs -f deployment/[service-name] -n timee-production`
2. **检查资源状态**：`kubectl get all -n timee-production`
3. **查看事件**：`kubectl get events -n timee-production --sort-by=.metadata.creationTimestamp`
4. **联系 Sealos 支持**：访问 Sealos 官方文档和社区

---

## 🎉 恭喜！

您的 Timee 项目现在已经成功部署到 Sealos 平台！

访问地址：**https://timee.group**

享受您的在线团队时间协调工具吧！ 🎊 