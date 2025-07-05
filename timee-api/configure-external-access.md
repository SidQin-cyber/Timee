# 🔧 通过Sealos Web界面配置外部访问

## 当前状态分析
✅ 端口8080已经映射 (从截图确认)  
❌ 外部URL返回404 - 需要配置Ingress规则

## 🎯 解决方案：配置Ingress

### 方法1: 通过Sealos应用商店配置Ingress

1. **打开Sealos控制台**
   - 访问: https://cloud.sealos.io
   - 进入你的项目

2. **进入应用管理**
   - 点击左侧菜单 "应用管理"
   - 或者点击 "App Launchpad"

3. **创建新应用**
   - 点击 "新建应用"
   - 选择 "外部访问" 或 "Ingress"

4. **配置Ingress规则**
   ```yaml
   应用名称: timee-api-ingress
   域名: wmxkwzbmhlj.sealoshzh.site
   路径: /api
   后端服务: devbox-timee
   端口: 8080
   ```

### 方法2: 直接修改DevBox网络配置

1. **进入DevBox设置**
   - 在DevBox列表中找到 "devbox-timee"
   - 点击右侧的 "设置" 图标

2. **高级网络配置**
   - 查找 "高级网络" 或 "Ingress" 选项
   - 启用 "自定义域名" 或 "外部访问"

3. **配置路径映射**
   ```
   域名: wmxkwzbmhlj.sealoshzh.site
   路径: /api -> 转发到端口8080
   协议: HTTP
   ```

### 方法3: 使用YAML配置 (如果支持)

如果Sealos支持YAML导入：

1. **进入YAML编辑器**
   - 寻找 "YAML" 或 "配置" 选项

2. **应用以下配置**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: timee-api-ingress
     namespace: ns-upg0e2qv
     annotations:
       kubernetes.io/ingress.class: nginx
       nginx.ingress.kubernetes.io/rewrite-target: /$1
   spec:
     rules:
     - host: wmxkwzbmhlj.sealoshzh.site
       http:
         paths:
         - path: /(.*)
           pathType: Prefix
           backend:
             service:
               name: devbox-timee-service
               port:
                 number: 8080
   ```

## 🧪 验证配置

配置完成后，测试以下URL：

```bash
# 1. 健康检查
curl "http://wmxkwzbmhlj.sealoshzh.site/api/health"

# 2. API根路径
curl "http://wmxkwzbmhlj.sealoshzh.site/api"

# 3. 事件列表
curl "http://wmxkwzbmhlj.sealoshzh.site/api/events"
```

## 📱 预期结果

配置成功后应该看到：
- ✅ `http://wmxkwzbmhlj.sealoshzh.site/api/health` → 返回API健康信息
- ✅ `http://wmxkwzbmhlj.sealoshzh.site/api` → 返回 "Timee API is running! 🚀"
- ✅ `http://wmxkwzbmhlj.sealoshzh.site/api/events` → 返回事件JSON数据

## 🔄 如果仍然404

1. **检查服务名称**
   - 确认后端服务名称是否正确
   - 可能需要使用完整的服务名

2. **检查端口映射**
   - 确认8080端口确实在监听
   - 检查内部服务是否正常

3. **等待生效**
   - Ingress配置可能需要1-2分钟生效
   - 可以尝试清除浏览器缓存

4. **重启DevBox**
   - 如果配置不生效，尝试重启DevBox实例

## 🆘 快速验证命令

在DevBox终端中运行：
```bash
cd /home/devbox/project/timee-api
./quick-external-setup.sh
```

这会自动检测外部访问是否配置成功。 