#!/bin/bash

echo "⚡ 快速修复 Timee 生产环境问题..."

# 修复你的环境变量配置
echo "🔧 更新环境变量配置..."

# 你当前的环境变量是正确的，但需要添加 ALLOWED_ORIGINS
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db"
export JWT_SECRET="TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM="
export CORS_ORIGIN="https://timee.group"
export PROXY_PORT=8080

# 关键添加：设置 ALLOWED_ORIGINS 以支持实际访问的域名
export ALLOWED_ORIGINS="https://timee.group,https://wmxkwzbmhflj.sealoshzh.site,http://localhost:8080"
export LOG_LEVEL="debug"

echo "✅ 环境变量已设置:"
echo "   NODE_ENV: $NODE_ENV"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   JWT_SECRET: [HIDDEN]"
echo "   CORS_ORIGIN: $CORS_ORIGIN"
echo "   ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
echo "   PROXY_PORT: $PROXY_PORT"

# 创建 .env 文件以确保环境变量持久化
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db
JWT_SECRET=TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=
CORS_ORIGIN=https://timee.group
ALLOWED_ORIGINS=https://timee.group,https://wmxkwzbmhflj.sealoshzh.site,http://localhost:8080
PROXY_PORT=8080
LOG_LEVEL=debug
EOF

echo "📁 已创建 .env 文件"

# 确保日志目录存在
mkdir -p logs

echo ""
echo "🚀 现在请运行以下命令来重启服务:"
echo ""
echo "   source .env"
echo "   ./restart-with-fix.sh"
echo ""
echo "🌐 然后访问: http://localhost:8080/production-debug.html"
echo "📝 查看日志: tail -f logs/api-fixed.log" 