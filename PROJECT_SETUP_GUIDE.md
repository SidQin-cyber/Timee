# 🚀 Timee Project Setup Guide

## 📋 项目概述

Timee 是一个团队时间协调工具，包含以下组件：
- **前端**: React + TypeScript + Vite
- **后端**: NestJS + TypeScript + Prisma
- **数据库**: PostgreSQL
- **代理服务器**: Express.js

## 🔧 修复完成的配置问题

### ✅ 已修复的问题

1. **端口配置统一化**
   - ✅ 前端代理配置：`localhost:3000`
   - ✅ 后端API端口：`3000`
   - ✅ 前端开发服务器：`5173`
   - ✅ 代理服务器：`8080`

2. **域名配置统一化**
   - ✅ 生产环境域名：`https://wmxkwzbmhflj.sealoshzh.site`
   - ✅ 所有配置文件使用统一域名

3. **环境变量管理**
   - ✅ 创建了统一的环境变量文档
   - ✅ 配置了开发和生产环境变量

4. **启动脚本优化**
   - ✅ 创建了统一的服务启动脚本
   - ✅ 提供了开发和生产环境脚本

## 🚀 快速开始

### 方法1：使用快速开发脚本（推荐）

```bash
# 启动开发环境
./start-dev.sh

# 或者使用完整的服务管理脚本
./start-services.sh
```

### 方法2：手动启动各服务

```bash
# 1. 启动后端API
cd timee-api
npm install
npm run start:dev

# 2. 启动前端（新终端）
cd timee-frontend/apps/web
npm install  
npm run dev

# 3. 启动代理服务器（新终端）
node proxy-server.js
```

### 方法3：生产环境启动

```bash
# 启动生产环境
./start-prod.sh
```

## 🌐 访问地址

### 开发环境
- 🌐 **应用入口**: http://localhost:8080
- 📱 **前端直接访问**: http://localhost:5173
- 📡 **后端API**: http://localhost:3000/api
- 🔍 **API健康检查**: http://localhost:3000/api/health

### 生产环境
- 🌐 **应用入口**: http://localhost:8080
- 🌍 **外部访问**: https://wmxkwzbmhflj.sealoshzh.site
- 📡 **后端API**: http://localhost:3000/api

## 📊 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Proxy Server  │    │    Frontend     │    │   Backend API   │
│   (Port 8080)   │◄──►│   (Port 5173)   │◄──►│   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                            ┌─────────────────┐
│   Client        │                            │   PostgreSQL    │
│   Browser       │                            │   Database      │
└─────────────────┘                            └─────────────────┘
```

## 📝 环境变量配置

### 开发环境
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"
JWT_SECRET="timee-super-secure-jwt-secret-2024"
CORS_ORIGIN="*"
LOG_LEVEL="debug"
PROXY_PORT=8080
```

### 生产环境
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"
JWT_SECRET="timee-super-secure-jwt-secret-2024"
CORS_ORIGIN="https://wmxkwzbmhflj.sealoshzh.site"
LOG_LEVEL="warn"
PROXY_PORT=8080
```

## 🛠️ 开发命令

### 后端开发
```bash
cd timee-api
npm install              # 安装依赖
npm run start:dev        # 启动开发服务器
npm run build           # 构建生产版本
npm run start:prod      # 启动生产服务器
npx prisma generate     # 生成Prisma客户端
npx prisma migrate dev  # 运行数据库迁移
```

### 前端开发
```bash
cd timee-frontend/apps/web
npm install           # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

### 代理服务器
```bash
node proxy-server.js           # 开发环境代理
node proxy-server-production.js # 生产环境代理
```

## 🔍 故障排除

### 端口冲突
```bash
# 查看端口占用
lsof -i :3000
lsof -i :5173
lsof -i :8080

# 终止进程
kill -9 <PID>
```

### 服务健康检查
```bash
# 检查后端API
curl http://localhost:3000/api/health

# 检查代理服务器
curl http://localhost:8080/health

# 检查前端
curl http://localhost:5173
```

### 日志查看
```bash
# 查看服务日志（如果使用 start-services.sh）
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/proxy.log
```

## 📚 API 端点

### 主要API端点
- `GET /api/health` - 健康检查
- `GET /api/events` - 获取事件列表
- `POST /api/events` - 创建事件
- `GET /api/events/:id` - 获取特定事件
- `PATCH /api/events/:id` - 更新事件
- `DELETE /api/events/:id` - 删除事件
- `GET /api/responses` - 获取响应列表
- `POST /api/responses` - 创建响应

### WebSocket 支持
- 实时事件更新
- 响应同步
- 连接状态监控

## 📦 项目结构

```
timee-project/
├── timee-api/                 # 后端API
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── events/           # 事件模块
│   │   ├── responses/        # 响应模块
│   │   └── prisma/           # 数据库模块
│   └── prisma/               # 数据库Schema
├── timee-frontend/           # 前端项目
│   └── apps/web/            # Web应用
│       ├── src/
│       │   ├── components/  # React组件
│       │   ├── lib/         # 工具库
│       │   └── types/       # TypeScript类型
├── proxy-server.js          # 代理服务器
├── start-dev.sh             # 开发环境启动
├── start-prod.sh            # 生产环境启动
├── start-services.sh        # 完整服务管理
└── ENV_CONFIG.md            # 环境变量配置
```

## 🎯 下一步建议

1. **测试所有服务**
   ```bash
   ./start-dev.sh
   # 在浏览器中访问 http://localhost:8080
   ```

2. **配置EmailJS**（可选）
   - 在前端设置EmailJS环境变量
   - 配置邮件通知功能

3. **数据库迁移**
   ```bash
   cd timee-api
   npx prisma migrate deploy
   ```

4. **生产环境部署**
   - 使用 `start-prod.sh` 启动生产环境
   - 配置SSL证书
   - 设置反向代理

## 🆘 支持

如果遇到问题，请检查：
1. 所有依赖是否正确安装
2. 端口是否被占用
3. 环境变量是否正确配置
4. 数据库连接是否正常

查看详细配置信息：[ENV_CONFIG.md](./ENV_CONFIG.md) 