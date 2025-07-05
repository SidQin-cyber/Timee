# 🚀 Timee API 外部访问部署指南

## 当前状态
- ✅ **API服务运行正常**: `localhost:8080/api`
- ✅ **数据库连接正常**: PostgreSQL
- ✅ **测试面板可用**: `localhost:3000/timee-api/test-dashboard.html`
- ❌ **外部访问待配置**: `http://wmxkwzbmhlj.sealoshzh.site/api`

## 🎯 目标
让前端应用能够通过 `http://wmxkwzbmhlj.sealoshzh.site/api` 访问Timee API

## 📋 解决方案 (按优先级排序)

### 方案1: Sealos DevBox 端口映射 (推荐)

1. **打开Sealos控制台**
   ```
   URL: https://cloud.sealos.io
   ```

2. **导航到DevBox**
   - 点击左侧菜单 "DevBox"
   - 找到 "devbox-timee" 实例

3. **配置网络设置**
   - 点击 "设置" 或 "网络配置"
   - 查找 "端口映射" 或 "Port Mapping" 选项
   - 添加新映射:
     ```
     内部端口: 8080
     外部端口: 8080 (或自动分配)
     协议: HTTP
     路径: /api (可选)
     ```

4. **保存并重启**
   - 保存配置
   - 重启DevBox实例
   - 等待实例完全启动

### 方案2: 使用kubectl应用配置

如果你有kubectl访问权限：

```bash
# 应用外部服务配置
kubectl apply -f sealos-external-service.yaml

# 检查服务状态
kubectl get svc -n ns-upg0e2qv | grep timee
kubectl get ingress -n ns-upg0e2qv | grep timee
```

### 方案3: 临时隧道解决方案

```bash
# 使用cloudflared (免费)
./cloudflared tunnel --url http://localhost:8080

# 或使用其他隧道工具
# 会获得一个临时的公共URL
```

## 🔍 验证外部访问

配置完成后，测试以下端点：

```bash
# 健康检查
curl "http://wmxkwzbmhlj.sealoshzh.site/api/health"

# 事件列表
curl "http://wmxkwzbmhlj.sealoshzh.site/api/events"

# 创建测试事件
curl -X POST "http://wmxkwzbmhlj.sealoshzh.site/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "external-test",
    "title": "外部访问测试",
    "startDate": "2025-06-20",
    "endDate": "2025-06-22",
    "eventType": "GROUP"
  }'
```

## 🌐 前端配置

外部访问配置成功后，前端应使用：

```javascript
// 生产环境API配置
const API_BASE_URL = 'http://wmxkwzbmhlj.sealoshzh.site/api';

// 示例请求
const response = await fetch(`${API_BASE_URL}/events`);
const events = await response.json();
```

## 🔧 故障排除

### 问题1: 404 错误
```bash
# 检查服务是否运行
curl "http://localhost:8080/api/health"

# 如果本地正常，检查端口映射配置
```

### 问题2: CORS 错误
```bash
# 检查API的CORS配置
curl -I "http://wmxkwzbmhlj.sealoshzh.site/api/health"

# 应该看到 Access-Control-Allow-Origin 头
```

### 问题3: 连接超时
- 检查防火墙设置
- 确认DevBox实例状态
- 检查Sealos网络配置

## 📞 获取帮助

1. **Sealos文档**: https://docs.sealos.io
2. **DevBox配置**: https://docs.sealos.io/guides/devbox/
3. **网络配置**: https://docs.sealos.io/guides/networking/

## 📝 配置检查清单

- [ ] DevBox实例运行正常
- [ ] 端口8080映射已配置
- [ ] 外部URL返回200状态
- [ ] CORS头正确设置
- [ ] 前端可以访问API

---

## ⚡ 快速测试命令

配置完成后运行：

```bash
cd /home/devbox/project/timee-api
./check-and-start.sh
```

这将自动检查所有服务状态并报告外部访问是否正常工作。

**目标**: 让 `http://wmxkwzbmhlj.sealoshzh.site/api` 返回 API 响应而不是404错误。 