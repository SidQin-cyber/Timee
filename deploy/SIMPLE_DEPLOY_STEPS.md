# 🚀 超简单 Sealos 部署步骤

## 第一步：登录 Sealos
1. 打开 https://cloud.sealos.io/
2. 使用微信或其他方式登录

## 第二步：创建数据库
1. 点击左侧菜单 "数据库"
2. 点击 "创建数据库"
3. 选择 PostgreSQL
4. 配置：
   - 数据库名: `timee_production`
   - 用户名: `timee_user`
   - 密码: `timee123456`（或你自己设定的密码）
   - 内存: 1GB
   - 存储: 5GB
5. 点击 "创建"
6. 等待数据库创建完成，记录下连接信息

## 第三步：部署后端 API
1. 点击左侧菜单 "应用管理"
2. 点击 "新建应用"
3. 选择 "从代码构建"
4. 配置：
   - 应用名称: `timee-api`
   - 代码仓库: 你的GitHub仓库地址
   - 分支: `main`
   - 构建路径: `timee-api`
   - 端口: `3000`
   - 副本数: `1`
5. 环境变量设置：
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://timee_user:timee123456@数据库连接地址:5432/timee_production
   JWT_SECRET=your-jwt-secret-key
   CORS_ORIGIN=https://timee.group
   ```
6. 点击 "创建"

## 第四步：部署前端
1. 再次点击 "新建应用"
2. 选择 "从代码构建"
3. 配置：
   - 应用名称: `timee-frontend`
   - 代码仓库: 你的GitHub仓库地址
   - 分支: `main`
   - 构建路径: `timee-frontend`
   - 端口: `80`
   - 副本数: `1`
4. 点击 "创建"

## 第五步：配置域名
1. 点击左侧菜单 "网络"
2. 点击 "创建域名"
3. 配置：
   - 域名: `timee.group`
   - 目标服务: `timee-frontend`
   - 端口: `80`
4. 启用 SSL 证书
5. 点击 "创建"

## 第六步：配置 DNS
1. 登录阿里云域名控制台
2. 进入 `timee.group` 域名管理
3. 添加 A 记录：
   - 主机记录: `@`
   - 记录类型: `A`
   - 记录值: Sealos提供的IP地址
4. 等待DNS生效（通常5-10分钟）

## 完成！
访问 https://timee.group 查看你的网站！ 