# Timee 项目快速部署指南

## 📋 当前状态
✅ 项目代码已完成  
✅ Docker 配置已准备  
✅ Sealos 配置已准备  
✅ 前端构建成功  
✅ 后端构建成功  

## 🚀 快速部署步骤

### 方法1：使用 Sealos 网页控制台部署（推荐）

#### 1. 访问 Sealos 控制台
- 打开 [Sealos 控制台](https://cloud.sealos.io/)
- 使用你的账号登录

#### 2. 部署后端 API
1. 点击 "应用管理" → "新建应用"
2. 选择 "从镜像创建"
3. 配置如下：
   ```
   应用名称: timee-api
   镜像地址: 需要先构建并推送到镜像仓库
   端口: 3000
   副本数: 2
   ```
4. 环境变量配置：
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=你的Sealos数据库连接字符串
   JWT_SECRET=你的JWT密钥
   ```

#### 3. 部署前端应用
1. 点击 "应用管理" → "新建应用"
2. 选择 "从镜像创建"
3. 配置如下：
   ```
   应用名称: timee-frontend
   镜像地址: 需要先构建并推送到镜像仓库
   端口: 80
   副本数: 2
   ```

#### 4. 配置域名和 SSL
1. 点击 "网络" → "域名管理"
2. 添加域名: `timee.group`
3. 选择目标服务: `timee-frontend`
4. 启用 SSL 证书自动申请

### 方法2：使用本地工具部署

#### 1. 安装 kubectl
```bash
# 下载 kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# 安装 kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证安装
kubectl version --client
```

#### 2. 获取 Sealos 集群配置
1. 在 Sealos 控制台中，点击 "终端"
2. 运行命令获取 kubeconfig:
   ```bash
   kubectl config view --raw > ~/.kube/config
   ```
3. 将配置文件下载到本地

#### 3. 配置容器镜像仓库
推荐使用阿里云容器镜像服务：
1. 登录阿里云控制台
2. 开通容器镜像服务
3. 创建命名空间，例如：`timee-project`
4. 获取登录凭证

#### 4. 构建并推送镜像
```bash
# 登录阿里云镜像仓库
docker login --username=你的用户名 registry.cn-hangzhou.aliyuncs.com

# 构建并推送镜像
cd /path/to/timee-project
./deploy/build-and-deploy.sh registry.cn-hangzhou.aliyuncs.com/你的命名空间 v1.0.0
```

### 方法3：直接使用 Sealos 应用商店

#### 1. 准备应用配置
将项目代码上传到 GitHub，然后：
1. 在 Sealos 控制台选择 "应用商店"
2. 选择 "从 Git 部署"
3. 输入 GitHub 仓库地址
4. 选择构建配置

## 🔧 数据库配置

### 1. 创建 PostgreSQL 数据库
在 Sealos 控制台中：
1. 点击 "数据库" → "创建数据库"
2. 选择 PostgreSQL
3. 配置：
   ```
   数据库名: timee_production
   用户名: timee_user
   密码: [安全密码]
   ```

### 2. 获取数据库连接字符串
格式：`postgresql://用户名:密码@数据库地址:5432/数据库名`

## 🌐 DNS 配置

### 1. 配置域名解析
在阿里云域名控制台中：
1. 进入 `timee.group` 域名管理
2. 添加 A 记录：
   ```
   主机记录: @
   记录类型: A
   记录值: Sealos集群的公网IP
   ```

### 2. 获取 Sealos 集群 IP
在 Sealos 控制台中运行：
```bash
kubectl get ingress -n timee-production
```

## 🎯 推荐的部署流程

### 第一次部署（最简单）
1. **使用 Sealos 网页控制台**
   - 直接在网页上配置应用
   - 无需安装本地工具
   - 适合快速验证

2. **准备镜像**
   - 可以使用 GitHub Actions 自动构建
   - 或在本地构建后推送到阿里云镜像仓库

3. **配置数据库**
   - 在 Sealos 控制台创建 PostgreSQL 数据库
   - 获取连接字符串

4. **配置域名**
   - 在阿里云配置 DNS 解析
   - 在 Sealos 配置 SSL 证书

### 后续更新
可以使用自动化脚本 `./deploy/build-and-deploy.sh` 进行一键部署

## 📞 需要帮助？

如果在部署过程中遇到问题：
1. 检查 [完整部署指南](./SEALOS_DEPLOYMENT_GUIDE.md)
2. 查看日志：`kubectl logs -f deployment/timee-api -n timee-production`
3. 检查服务状态：`kubectl get pods -n timee-production`

## 🔍 下一步
选择你倾向的部署方式，我们可以逐步进行配置和部署！ 

## 🎉 太棒了！现在一切都准备好了！

### ✅ 已完成：
- ✅ 数据库已准备好（你的PostgreSQL数据库）
- ✅ 配置文件已更新（使用你的实际数据库连接）
- ✅ 部署脚本已创建
- ✅ 前端和后端代码都没有错误

### 🚀 现在你只需要选择一种方式部署：

#### 🎯 方法1：直接用 Sealos 应用商店部署（最简单！）

1. **打开 Sealos 控制台**: https://cloud.sealos.io/
2. **点击 "应用商店"**
3. **选择 "从 Git 部署"**
4. **输入你的 GitHub 仓库地址**
5. **点击部署**

#### 🎯 方法2：使用我的一键部署脚本

1. **在 Sealos 控制台中打开终端**
2. **运行**：
   ```bash
   git clone [你的GitHub仓库地址]
   cd timee-project/deploy
   ./deploy-to-sealos.sh
   ```

### 🤔 如果你的代码还没有上传到 GitHub：

**运行这个脚本帮你上传**：
```bash
cd /home/devbox/project/deploy
./upload-to-github.sh
```

### 📋 你现在需要告诉我：

1. **你的代码是否已经在 GitHub 上？**
   - 如果有，请给我 GitHub 仓库地址
   - 如果没有，我可以帮你上传

2. **你倾向于用哪种方式部署？**
   - 方法1：Sealos 应用商店（图形界面）
   - 方法2：一键部署脚本（命令行）

### 🎯 完成后的结果：
- 🌐 网站地址：https://timee.group
- 🔧 API 地址：https://timee.group/api
- ❤️ 健康检查：https://timee.group/api/health

**你准备好开始了吗？告诉我你的选择，我会直接帮你完成部署！** 🚀 