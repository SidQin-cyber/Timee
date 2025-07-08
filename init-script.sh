#!/bin/bash

echo "🚀 Initializing Timee Application..."

# 安装git和基本工具
apk add --no-cache git curl postgresql-client

# 克隆项目代码
cd /tmp
git clone https://github.com/SidQin-cyber/Timee.git
cd Timee

# 安装后端依赖
cd timee-api
npm install
npx prisma generate

# 构建后端
npm run build

# 安装前端依赖  
cd ../timee-frontend
npm install

# 构建前端
npm run build

# 复制前端文件到后端public目录
cp -r apps/web/dist/* ../timee-api/public/

# 启动应用
cd ../timee-api
echo "📡 Starting backend on port 3000..."
npm start &

# 启动代理服务器
cd ..
echo "🔗 Starting proxy on port 8080..."
node proxy-server-simple.js &

wait 