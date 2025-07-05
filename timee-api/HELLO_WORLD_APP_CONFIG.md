# 🚀 配置hello-world App Launchpad作为Timee API代理

## 📋 **在Sealos App Launchpad中配置hello-world应用**

### 1. **基本应用设置**

进入你的hello-world应用配置页面，使用以下设置：

```yaml
应用名称: hello-world
镜像: nginx:alpine
CPU: 0.1 Core
内存: 128 Mi
副本数: 1
```

### 2. **端口配置**

```yaml
容器端口: 80
服务端口: 80
协议: HTTP
```

### 3. **外部访问配置**

```yaml
启用外部访问: ✅
自定义域名: wmxkwzbmhlj.sealoshzh.site
路径: / (根路径)
```

### 4. **环境变量配置**

添加以下环境变量：

```yaml
NGINX_HOST: wmxkwzbmhlj.sealoshzh.site
NGINX_PORT: 80
```

### 5. **ConfigMap配置 (重要)**

在高级配置中，添加ConfigMap或挂载配置文件：

**配置名称**: `nginx-config`
**挂载路径**: `/etc/nginx/conf.d/default.conf`
**配置内容**:
```nginx
server {
    listen 80;
    server_name wmxkwzbmhlj.sealoshzh.site;

    # Enable CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    add_header Access-Control-Allow-Headers "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization";

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization";
        return 204;
    }

    # Proxy API requests to Timee API
    location /api {
        proxy_pass http://devbox-timee.ns-upg0e2qv.svc.cluster.local:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://devbox-timee.ns-upg0e2qv.svc.cluster.local:8080/api/health;
    }

    # Default response
    location / {
        return 200 '{"status":"OK","message":"Timee API Proxy","endpoints":{"/api":"API endpoints","/health":"Health check"}}';
        add_header Content-Type application/json;
    }
}
```

## 🔧 **简化配置方案（推荐）**

如果ConfigMap配置太复杂，使用这个简化版本：

### 使用nginx镜像 + 启动命令

1. **镜像**: `nginx:alpine`

2. **启动命令** (在容器配置中添加):
```bash
/bin/sh -c "echo 'server { listen 80; location /api { proxy_pass http://devbox-timee.ns-upg0e2qv.svc.cluster.local:8080; proxy_set_header Host \$host; } location / { return 200 \"API Proxy Running\"; add_header Content-Type text/plain; } }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
```

## 🧪 **验证配置**

配置完成并部署后，测试以下URL：

```bash
# 1. 基础连接测试
curl "http://wmxkwzbmhlj.sealoshzh.site/"
# 预期: 代理状态信息

# 2. API健康检查
curl "http://wmxkwzbmhlj.sealoshzh.site/api/health"
# 预期: {"status":"OK","timestamp":"...","service":"Timee API"...}

# 3. API端点测试
curl "http://wmxkwzbmhlj.sealoshzh.site/api/events"
# 预期: JSON格式的事件数据
```

## 🎯 **前端配置**

一旦配置成功，你的前端可以使用：

```javascript
const API_BASE_URL = 'http://wmxkwzbmhlj.sealoshzh.site/api';

// 测试连接
fetch(`${API_BASE_URL}/health`)
  .then(response => response.json())
  .then(data => console.log('API连接成功:', data))
  .catch(error => console.error('连接失败:', error));
```

## 🔍 **故障排除**

### 如果hello-world应用无法启动：
1. 检查nginx镜像是否正确拉取
2. 检查端口配置是否正确
3. 查看应用日志

### 如果外部访问404：
1. 确认外部访问已启用
2. 检查域名配置是否正确
3. 等待DNS传播（1-2分钟）

### 如果API代理502错误：
1. 确认Timee API服务正在运行：`ps aux | grep node`
2. 检查内部服务名称是否正确
3. 确认网络连接正常

## ⚡ **快速验证命令**

配置完成后，在DevBox中运行：

```bash
cd /home/devbox/project/timee-api
./quick-external-setup.sh
```

**目标**: 让 `http://wmxkwzbmhlj.sealoshzh.site/api/health` 通过hello-world代理返回Timee API的健康信息。 