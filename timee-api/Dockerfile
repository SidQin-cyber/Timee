# 多阶段构建 Dockerfile - Timee API Express + Prisma
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 dev dependencies 用于 Prisma）
RUN npm ci --only=production --silent && \
    npm ci --only=development --silent

# 复制 Prisma schema
COPY prisma ./prisma/

# 生成 Prisma 客户端
RUN npx prisma generate

# 第二阶段：生产环境
FROM node:18-alpine AS production

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S timee -u 1001

# 设置工作目录
WORKDIR /app

# 复制必要文件
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY services ./services/
COPY src ./src/
COPY prisma ./prisma/

# 设置正确的所有权
RUN chown -R timee:nodejs /app

# 切换到非 root 用户
USER timee

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
CMD ["node", "src/index.js"] 