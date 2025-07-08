# Timee App Launchpad 部署指南

## 概述
本指南详细说明如何在 Sealos App Launchpad 上部署 Timee 应用。

## 预配置检查清单

### 1. 数据库配置
确保 PostgreSQL 数据库已正确配置：
- 服务名: `timee-postgresql`
- 端口: `5432`
- 数据库名: `timee_db`
- 用户: `postgres`
- 密码: `Qinguoqg123`

### 2. 环境变量配置
以下环境变量必须正确设置：

```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db
JWT_SECRET=TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=
CORS_ORIGIN=https://timee.group
```

## App Launchpad 配置

### 基本配置
- **应用名称**: `timee`
- **镜像**: 使用项目根目录的 `Dockerfile`
- **端口**: `8080`
- **CPU**: 500m-1000m
- **内存**: 1Gi-2Gi

### 环境变量设置
在 App Launchpad 中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|-----|
| `NODE_ENV` | `production` | 环境模式 |
| `DATABASE_URL` | `postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db` | 数据库连接字符串 |
| `JWT_SECRET` | `TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=` | JWT 密钥 |
| `CORS_ORIGIN` | `https://timee.group` | CORS 允许的源 |

### 健康检查配置
- **路径**: `/health`
- **端口**: `8080`
- **初始延迟**: 90秒
- **检查间隔**: 30秒
- **超时**: 10秒
- **重试次数**: 3次

### 服务配置
- **服务类型**: ClusterIP (如果需要外部访问则选择 LoadBalancer)
- **端口映射**: `8080:8080`

## 部署步骤

### 1. 准备镜像
在项目根目录执行：
```bash
# 构建镜像
docker build -t timee-app:latest .

# 可选：推送到镜像仓库
docker tag timee-app:latest your-registry/timee-app:latest
docker push your-registry/timee-app:latest
```

### 2. 在 App Launchpad 中创建应用
1. 打开 Sealos App Launchpad
2. 点击 "新建应用"
3. 填写应用信息：
   - 应用名: `timee`
   - 镜像: `timee-app:latest` (或你的镜像地址)
   - 端口: `8080`

### 3. 配置环境变量
在环境变量部分添加上述所有环境变量。

### 4. 配置资源限制
- CPU: 500m-1000m
- 内存: 1Gi-2Gi

### 5. 配置健康检查
- 路径: `/health`
- 端口: `8080`
- 其他参数按上述配置

### 6. 部署应用
点击"部署"按钮，等待应用启动。

## 验证部署

### 1. 检查应用状态
在 App Launchpad 中查看应用状态：
- 应用应该显示为 "Running"
- 健康检查应该通过

### 2. 测试应用端点
```bash
# 测试健康检查
curl -f http://your-app-url/health

# 测试 API 端点
curl -f http://your-app-url/api/health

# 测试前端
curl -f http://your-app-url/
```

### 3. 检查日志
在 App Launchpad 中查看应用日志：
- 应该看到 "All services started successfully!" 消息
- 应该看到各个服务的启动日志

## 故障排除

### 常见问题

#### 1. 应用卡在 "Preparing" 状态
**原因**: 容器启动脚本有问题或依赖安装失败
**解决方案**:
- 检查 `entrypoint-production.sh` 脚本
- 确保所有依赖都已正确安装
- 查看容器日志获取详细错误信息

#### 2. 健康检查失败
**原因**: 代理服务器没有正确启动或端口配置错误
**解决方案**:
- 确认端口 8080 正确暴露
- 检查代理服务器配置
- 验证 `/health` 端点是否正常工作

#### 3. 数据库连接失败
**原因**: 数据库配置错误或数据库服务未启动
**解决方案**:
- 验证数据库服务是否运行
- 检查 `DATABASE_URL` 环境变量
- 确认数据库名称和凭据正确

#### 4. CORS 错误
**原因**: CORS 配置不正确
**解决方案**:
- 检查 `CORS_ORIGIN` 环境变量
- 确认域名配置正确
- 验证后端 CORS 配置

### 日志分析
查看以下日志文件：
- `/app/logs/api.log` - 后端 API 日志
- `/app/logs/frontend.log` - 前端服务日志
- `/app/logs/proxy.log` - 代理服务器日志

## 优化建议

### 1. 性能优化
- 调整 CPU 和内存限制
- 启用日志轮转
- 配置适当的缓存策略

### 2. 安全优化
- 使用 Kubernetes secrets 管理敏感数据
- 启用 HTTPS
- 配置网络策略

### 3. 监控和告警
- 配置应用监控
- 设置告警规则
- 定期备份数据库

## 备份和恢复

### 备份数据库
```bash
kubectl exec -it timee-postgresql-xxx -- pg_dump -U postgres timee_db > backup.sql
```

### 恢复数据库
```bash
kubectl exec -i timee-postgresql-xxx -- psql -U postgres timee_db < backup.sql
```

## 更新部署

### 更新应用镜像
1. 构建新镜像
2. 推送到镜像仓库
3. 在 App Launchpad 中更新镜像标签
4. 重新部署应用

### 滚动更新
App Launchpad 支持零停机滚动更新，新版本会逐步替换旧版本。

## 联系支持
如果遇到问题，请：
1. 查看应用日志
2. 检查上述故障排除指南
3. 联系 Sealos 支持团队 