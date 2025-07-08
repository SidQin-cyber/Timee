# Sealos 自定义域名配置指南

## 📋 **配置清单**

### 1. 阿里云 DNS 配置
1. 登录 [阿里云控制台](https://dns.console.aliyun.com/)
2. 选择域名 `timee.group`
3. 添加解析记录：

```
记录类型: CNAME
主机记录: @
记录值: wmxkwzbmhflj.sealoshzh.site
TTL: 600

记录类型: CNAME  
主机记录: www
记录值: wmxkwzbmhflj.sealoshzh.site
TTL: 600
```

### 2. Sealos 平台配置

#### 方式一：通过 Sealos 控制台 (推荐)
1. 登录 [Sealos 控制台](https://sealos.run/)
2. 进入你的工作空间
3. 找到你的应用 -> 网络配置
4. 添加自定义域名:
   - 主域名: `timee.group`
   - 子域名: `www.timee.group`
5. 启用 SSL 证书自动申请

#### 方式二：通过命令行配置
```bash
# 如果你有 kubectl 访问权限
kubectl apply -f sealos-custom-domain.yaml -n ns-upg0e2qv
```

### 3. 等待生效
- DNS 解析生效时间：5-10 分钟
- SSL 证书申请时间：1-5 分钟

### 4. 验证配置
运行测试脚本：
```bash
chmod +x test-domain-config.sh
./test-domain-config.sh
```

## 🚀 **预期结果**

配置完成后：
- ✅ `http://timee.group` → 自动重定向到 `https://timee.group`
- ✅ `https://timee.group` → 显示你的 Timee 应用
- ✅ `https://www.timee.group` → 显示你的 Timee 应用
- ✅ SSL 证书有效

## 🔧 **故障排除**

### 问题 1：域名无法访问
- 检查 DNS 解析是否生效: `dig timee.group`
- 确认 CNAME 记录配置正确

### 问题 2：SSL 证书问题
- 等待 5-10 分钟让 Let's Encrypt 证书生效
- 检查 Sealos 控制台中的证书状态

### 问题 3：404 错误
- 确认 Sealos 应用正在运行
- 检查端口配置是否正确 (8080)

## 📞 **联系支持**
如果遇到问题，可以：
1. 查看 Sealos 控制台的日志
2. 联系 Sealos 技术支持
3. 检查阿里云 DNS 配置 