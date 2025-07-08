#!/bin/bash

# 设置生产环境变量
export NODE_ENV=production
export DATABASE_URL=postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db
export JWT_SECRET=TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=
export CORS_ORIGIN="*"
export ALLOWED_ORIGINS="https://www.timee.group,https://timee.group,https://buchleuycboo.sealoshzh.site,https://wmxkwzbmhflj.sealoshzh.site,http://localhost:8080,http://localhost:5173,http://localhost:3000"
export EXTERNAL_API_URL="https://www.timee.group"
export PROXY_PORT=8080
export RATE_LIMIT_MAX=200
export RATE_LIMIT_WINDOW=900000
export LOG_LEVEL=info

echo "🚀 启动生产环境服务..."
echo "📝 环境变量设置完成"
echo "🌐 CORS_ORIGIN: $CORS_ORIGIN"
echo "🌐 ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
echo "🌐 EXTERNAL_API_URL: $EXTERNAL_API_URL"

# 创建日志目录
mkdir -p logs

# 清除旧的日志文件
> logs/api-production.log
> logs/frontend-production.log
> logs/proxy-production.log

# 启动后端服务
echo "🔧 启动后端服务..."
cd timee-api
npm run start:prod > ../logs/api-production.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 5

# 启动前端服务
echo "🔧 启动前端服务..."
cd ../timee-frontend/apps/web
npm run preview -- --host 0.0.0.0 --port 5173 > ../../../logs/frontend-production.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
sleep 3

# 启动代理服务
echo "🔧 启动代理服务..."
cd ../../..
if [ -f proxy-server.js ]; then
    node proxy-server.js > logs/proxy-production.log 2>&1 &
    PROXY_PID=$!
    echo "✅ 代理服务已启动 (PID: $PROXY_PID)"
else
    echo "⚠️  代理服务器文件不存在，跳过启动"
fi

# 保存进程ID
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
if [ ! -z "$PROXY_PID" ]; then
    echo "$PROXY_PID" > .proxy.pid
fi

echo ""
echo "🎉 所有服务已启动完成！"
echo ""
echo "🌐 访问地址:"
echo "   主应用:        http://localhost:8080"
echo "   前端服务:      http://localhost:5173"
echo "   后端 API:      http://localhost:3000/api"
echo "   外部域名:      https://www.timee.group"
echo ""
echo "📊 服务进程:"
echo "   后端 PID:      $BACKEND_PID"
echo "   前端 PID:      $FRONTEND_PID"
if [ ! -z "$PROXY_PID" ]; then
    echo "   代理 PID:      $PROXY_PID"
fi
echo ""
echo "📝 日志文件:"
echo "   后端:          logs/api-production.log"
echo "   前端:          logs/frontend-production.log"
echo "   代理:          logs/proxy-production.log"
echo ""
echo "🔍 查看日志: tail -f logs/api-production.log"
echo "🔄 重启服务: ./start-production.sh"
echo "🛑 停止服务: ./stop-services.sh" 