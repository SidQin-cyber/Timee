# 多阶段构建优化的 Timee 应用镜像
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache \
    curl \
    postgresql-client \
    bash \
    && rm -rf /var/cache/apk/*

# 设置工作目录
WORKDIR /app

# 后端构建阶段
FROM base AS backend-builder

# 复制后端 package.json 和 package-lock.json
COPY timee-api/package*.json ./timee-api/
WORKDIR /app/timee-api

# 安装后端依赖
RUN npm ci --only=production && npm cache clean --force

# 复制后端源代码
COPY timee-api/ ./

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建后端
RUN npm run build

# 前端构建阶段
FROM base AS frontend-builder

# 复制前端 package.json 和 package-lock.json
COPY timee-frontend/apps/web/package*.json ./timee-frontend/apps/web/
WORKDIR /app/timee-frontend/apps/web

# 安装前端依赖
RUN npm ci --only=production && npm cache clean --force

# 复制前端源代码
COPY timee-frontend/apps/web/ ./

# 构建前端
RUN npm run build

# 生产运行阶段
FROM base AS production

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# 复制构建好的后端
COPY --from=backend-builder --chown=nextjs:nodejs /app/timee-api/dist /app/timee-api/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/timee-api/node_modules /app/timee-api/node_modules
COPY --from=backend-builder --chown=nextjs:nodejs /app/timee-api/package*.json /app/timee-api/

# 复制构建好的前端
COPY --from=frontend-builder --chown=nextjs:nodejs /app/timee-frontend/apps/web/dist /app/timee-frontend/apps/web/dist
COPY --from=frontend-builder --chown=nextjs:nodejs /app/timee-frontend/apps/web/node_modules /app/timee-frontend/apps/web/node_modules
COPY --from=frontend-builder --chown=nextjs:nodejs /app/timee-frontend/apps/web/package*.json /app/timee-frontend/apps/web/

# 复制代理服务器
COPY --chown=nextjs:nodejs proxy-server.js /app/
COPY --chown=nextjs:nodejs proxy-server-simple.js /app/

# 复制启动脚本
COPY --chown=nextjs:nodejs entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# 创建日志目录
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动应用
CMD ["/app/entrypoint.sh"] 