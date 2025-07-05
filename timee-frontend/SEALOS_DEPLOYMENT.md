# Sealos 部署指南

## 前置条件

1. 注册 [Sealos 账号](https://cloud.sealos.io/)
2. 准备你的域名

## 部署步骤

### 步骤 1：创建数据库

1. 登录 Sealos 控制台
2. 点击 "数据库" 应用
3. 创建 PostgreSQL 数据库：
   - 数据库名称: `timee`
   - 用户名: `timee`
   - 密码: 设置一个安全密码
4. 记录下连接信息：
   ```
   DATABASE_URL=postgresql://用户名:密码@内网地址:5432/数据库名
   ```

### 步骤 2：上传代码到 DevBox

1. 点击 "DevBox" 应用
2. 创建新的开发环境：
   - 选择 "Node.js" 模板
   - 配置名称: `timee-backend`
3. 上传后端代码到 DevBox
4. 在 DevBox 中运行：
   ```bash
   cd apps/api
   npm install
   npx prisma migrate deploy
   npx prisma generate
   ```

### 步骤 3：构建和部署应用

1. 在 DevBox 中构建应用：
   ```bash
   npm run build
   ```

2. 点击 "发布" 按钮创建新版本

3. 配置环境变量：
   - `DATABASE_URL`: 从步骤1获取的数据库连接字符串
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `CORS_ORIGIN`: 你的前端域名

4. 设置资源配置：
   - CPU: 0.1-0.5 cores
   - 内存: 128-512 MB

### 步骤 4：配置域名和 HTTPS

1. 在应用详情页面，找到 "网络" 配置
2. 绑定你的自定义域名
3. 启用 HTTPS（Sealos 自动提供 SSL 证书）

### 步骤 5：测试部署

访问以下 API 端点测试：
- `https://你的域名/api/events/recent` - 获取最近事件
- `https://你的域名/api` - API 根路径

## 环境变量说明

```bash
# 必需环境变量
DATABASE_URL=postgresql://用户名:密码@数据库地址:5432/数据库名
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://你的前端域名

# 可选环境变量
JWT_SECRET=你的JWT密钥
REDIS_URL=redis://redis地址:6379  # 如果使用 Redis
```

## 监控和日志

1. 在 Sealos 控制台可以查看：
   - 应用状态和资源使用情况
   - 实时日志
   - 性能监控

2. 设置告警：
   - CPU 使用率 > 80%
   - 内存使用率 > 80%
   - 应用重启

## 扩容配置

根据访问量调整资源：
- 轻量使用: 0.1 CPU, 128MB 内存
- 中等使用: 0.3 CPU, 256MB 内存  
- 高负载: 0.5 CPU, 512MB 内存

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 DATABASE_URL 是否正确
   - 确认数据库服务是否正常运行

2. **应用启动失败**
   - 查看日志中的错误信息
   - 检查环境变量配置

3. **CORS 错误**
   - 确认 CORS_ORIGIN 设置为正确的前端域名

### 日志查看

```bash
# 在 Sealos 控制台的 "日志" 选项卡查看
# 或使用 kubectl 命令（如果有权限）
kubectl logs deployment/timee-api -f
``` 