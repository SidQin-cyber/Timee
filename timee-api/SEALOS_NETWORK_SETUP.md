# 🌐 Sealos外部访问配置指南

## 当前状态
- ✅ **API服务正常运行**: `localhost:8080`
- ✅ **服务监听外部**: `0.0.0.0:8080`
- ❌ **外部URL无法访问**: `http://wmxkwzbmhlj.sealoshzh.site/api` 返回404

## 解决方案选择

### 方案1: 使用Sealos DevBox网络映射（推荐）

1. **打开Sealos控制台**
   - 访问: https://cloud.sealos.io
   - 登录你的账户

2. **进入DevBox管理**
   - 点击 "DevBox" 应用
   - 找到你的 `devbox-timee` 实例
   - 点击 "设置" 或 "配置"

3. **配置端口映射**
   - 查找 "网络" 或 "端口映射" 选项
   - 添加新的端口映射:
     ```
     内部端口: 8080
     外部端口: 8080 (或任意可用端口)
     协议: HTTP
     ```

4. **保存并重启**
   - 保存配置
   - 重启DevBox实例

### 方案2: 使用kubectl直接配置

如果你有kubectl访问权限，可以应用配置文件：

```bash
kubectl apply -f sealos-port-mapping.yaml
```

### 方案3: 临时解决方案 - 使用ngrok

如果其他方案不可行，可以使用ngrok临时暴露服务：

```bash
# 安装ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# 暴露8080端口
./ngrok http 8080
```

## 验证外部访问

配置完成后，测试以下URL：

```bash
# 健康检查
curl http://wmxkwzbmhlj.sealoshzh.site/api/health

# API根端点  
curl http://wmxkwzbmhlj.sealoshzh.site/api

# 事件列表
curl http://wmxkwzbmhlj.sealoshzh.site/api/events
```

## 前端配置

外部访问配置成功后，前端可以使用：

```typescript
const API_BASE_URL = 'http://wmxkwzbmhlj.sealoshzh.site/api';
```

## 故障排除

### 如果仍然404：
1. 确认DevBox端口映射配置正确
2. 检查防火墙设置
3. 确认域名解析正确

### 如果服务无响应：
```bash
# 检查服务状态
ps aux | grep node
netstat -tlnp | grep 8080

# 重启服务
cd /home/devbox/project/timee-api
npm run start:dev
```

## 联系支持

如果问题持续存在，可以：
1. 查看Sealos文档: https://docs.sealos.io
2. 联系Sealos技术支持
3. 检查DevBox实例的网络配置

---

**当前API服务运行正常，只需要配置外部访问即可完成部署！** 🚀 