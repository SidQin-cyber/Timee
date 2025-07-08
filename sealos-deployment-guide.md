# Sealos Application Deployment 配置指南

## 📋 **表单填写指南**

### 1. **Basic 配置**
```
Name: timee-app
Image: 选择 "Public" 
Image Name: node:18-alpine
```

### 2. **Deployment Information**
```
Deployment Type: Fixed
Replicas: 1
```

### 3. **Resource Configuration**
```
CPU: 0.5 (Core)
Memory: 512 M
```

### 4. **Network 配置**
```
Container Port: 8080
Enable Internet Access: ✅ 开启
```

### 5. **Environment Variables** (在 Advanced Configuration 中)
```
DATABASE_URL: postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres
NODE_ENV: production
```

## 🚀 **部署步骤**

### 方案一：使用 DevBox 作为基础镜像 (推荐)
如果你想保持当前的配置，可以：

1. **Name**: `timee-app`
2. **Image**: 选择 "Public"
3. **Image Name**: `node:18-alpine`
4. **Container Port**: `8080`
5. **启用互联网访问**: ✅

### 方案二：构建自定义镜像
1. 先构建Docker镜像：
   ```bash
   docker build -f Dockerfile.production -t timee-app:latest .
   ```

2. 推送到镜像仓库
3. 在Sealos中使用该镜像

## 🎯 **推荐配置**

基于你当前的应用运行状态，推荐的配置：

```yaml
Name: timee-app
Image: Public
Image Name: node:18-alpine
Container Port: 8080
CPU: 0.5 Core
Memory: 512 M
Enable Internet Access: ✅
```

## 🔧 **部署后配置**

1. **等待部署完成**
2. **获取访问地址**
3. **配置自定义域名** (参考之前的域名配置指南)
4. **验证应用功能**

## ⚠️ **重要提醒**

- 确保数据库连接配置正确
- 检查环境变量设置
- 验证端口配置 (8080)
- 确认资源配置足够

## 📞 **如果遇到问题**

1. 检查应用日志
2. 验证数据库连接
3. 确认端口配置
4. 检查网络设置 