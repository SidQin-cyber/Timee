#!/bin/bash

echo "🔧 Setting up Timee environment variables..."

# 设置环境变量
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db"
export NODE_ENV="production"
export PORT=3000
export JWT_SECRET="TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM="
export CORS_ORIGIN="https://timee.group"
export PROXY_PORT=8080

# 写入到环境文件
cat > .env.production << EOF
DATABASE_URL=postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db
NODE_ENV=production
PORT=3000
JWT_SECRET=TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM=
CORS_ORIGIN=https://timee.group
PROXY_PORT=8080
EOF

echo "✅ Environment variables set:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   JWT_SECRET: [HIDDEN]"
echo "   CORS_ORIGIN: $CORS_ORIGIN"
echo "   PROXY_PORT: $PROXY_PORT"
echo ""
echo "📁 Environment file created: .env.production"
echo ""
echo "🚀 Ready to start services!" 