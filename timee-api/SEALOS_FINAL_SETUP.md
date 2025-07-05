# 🎯 Sealos 外部访问最终配置指南

## 📊 当前状态
- ✅ API服务运行正常：`localhost:8080/api`
- ✅ 端口8080已映射：`wmxkwzbmhlj.sealoshzh.site:80`
- ❌ 路径映射缺失：返回404错误

## 🔧 解决方案：配置 Ingress (路径映射)

### 方法1：通过 Sealos App Launchpad (推荐)

1. **打开 Sealos 控制台**
   - 访问：https://cloud.sealos.io
   - 进入你的项目空间

2. **进入应用管理 (App Launchpad)**
   - 点击左侧菜单的 "应用管理" 或 "App Launchpad"

3. **创建新的外部访问应用**
   - 点击 "部署新应用"
   - 选择 "外部访问" 或查找 "Ingress" 相关选项

4. **配置外部访问规则**
   ```
   应用名称：timee-api-proxy
   镜像：nginx (任意轻量镜像)
   端口：80
   
   网络配置：
   - 启用外部访问
   - 自定义域名：wmxkwzbmhlj.sealoshzh.site
   - 路径：/api -> 后端服务：devbox-timee:8080
   ```

### 方法2：修改 DevBox 的网络配置

1. **进入 DevBox 设置**
   - 在 DevBox 列表找到 "devbox-timee"
   - 点击右侧的"⚙️ 设置"或"网络"图标

2. **配置高级网络**
   - 查找 "域名绑定" 或 "自定义域名" 选项
   - 域名：`wmxkwzbmhlj.sealoshzh.site`
   - 路径：`/api` → 端口：`8080`

3. **保存并重启**
   - 保存配置
   - 重启 DevBox 实例

### 方法3：创建 Service 和 Ingress

如果Sealos支持YAML配置：

1. **创建Service配置**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: timee-api-svc
     namespace: ns-upg0e2qv
   spec:
     selector:
       app: devbox-timee
     ports:
     - port: 8080
       targetPort: 8080
   ```

2. **创建Ingress配置**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: timee-api-ingress
     namespace: ns-upg0e2qv
   spec:
     rules:
     - host: wmxkwzbmhlj.sealoshzh.site
       http:
         paths:
         - path: /api
           pathType: Prefix
           backend:
             service:
               name: timee-api-svc
               port:
                 number: 8080
   ```

## 🎯 快速验证

配置完成后，这些URL应该工作：

```bash
# 健康检查
curl "http://wmxkwzbmhlj.sealoshzh.site/api/health"
# 预期: {"status":"OK","timestamp":"...","service":"Timee API"...}

# API根路径
curl "http://wmxkwzbmhlj.sealoshzh.site/api"
# 预期: "Timee API is running! 🚀"

# 事件列表
curl "http://wmxkwzbmhlj.sealoshzh.site/api/events"
# 预期: [{"id":"test-event-1",...}]
```

## 🔍 故障排除

### 如果仍然404：

1. **检查服务标签**
   ```bash
   # 在DevBox终端运行，检查服务是否正确运行
   netstat -tlnp | grep 8080
   ```

2. **等待DNS生效**
   - 配置可能需要1-5分钟生效
   - 清除浏览器缓存

3. **重启DevBox**
   - 完全重启DevBox实例
   - 等待完全启动后再测试

### 如果502错误：
- API服务可能没有运行，检查DevBox内部服务状态

### 如果超时：
- 检查防火墙或网络配置

## 🚀 前端配置

一旦外部访问工作，你的前端可以使用：

```javascript
const API_BASE_URL = 'http://wmxkwzbmhlj.sealoshzh.site/api';

// 测试连接
fetch(`${API_BASE_URL}/health`)
  .then(r => r.json())
  .then(data => console.log('API连接成功:', data));
```

## 📞 联系我

配置完成后，运行验证脚本：
```bash
cd /home/devbox/project/timee-api
./quick-external-setup.sh
```

如果外部访问正常工作，你应该看到：
- ✅ 本地API: 正常
- ✅ 外部API: 正常

**目标**：让 `http://wmxkwzbmhlj.sealoshzh.site/api/health` 返回API健康信息，而不是404。 