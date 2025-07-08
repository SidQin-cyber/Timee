#!/bin/bash

# ==============================================
# Timee Project - Production Environment Start
# ==============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Timee Production Environment...${NC}"

# Setup production environment variables
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"
export JWT_SECRET="timee-super-secure-jwt-secret-2024"
export CORS_ORIGIN="https://wmxkwzbmhflj.sealoshzh.site"
export LOG_LEVEL="warn"
export PROXY_PORT=8080

# Build frontend first
echo -e "${BLUE}🔨 Building Frontend...${NC}"
cd timee-frontend/apps/web
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ../../..

# Build backend
echo -e "${BLUE}🔨 Building Backend...${NC}"
cd timee-api
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ..

# Start backend in production mode
echo -e "${BLUE}📡 Starting Backend API (Production)...${NC}"
cd timee-api
npm run start:prod &
BACKEND_PID=$!
cd ..

# Start frontend in preview mode
echo -e "${BLUE}💻 Starting Frontend (Preview)...${NC}"
cd timee-frontend/apps/web
npm run preview &
FRONTEND_PID=$!
cd ../../..

# Start proxy server (production config)
echo -e "${BLUE}🔄 Starting Proxy Server (Production)...${NC}"
node proxy-server-production.js &
PROXY_PID=$!

# Wait for services to start
sleep 10

# Check if all services are running
echo -e "${BLUE}🔍 Checking service status...${NC}"

# Check backend
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API - Running${NC}"
else
    echo -e "${RED}❌ Backend API - Failed to start${NC}"
fi

# Check frontend
if curl -s http://localhost:5174 > /dev/null; then
    echo -e "${GREEN}✅ Frontend - Running${NC}"
else
    echo -e "${RED}❌ Frontend - Failed to start${NC}"
fi

# Check proxy
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ Proxy Server - Running${NC}"
else
    echo -e "${RED}❌ Proxy Server - Failed to start${NC}"
fi

echo ""
echo -e "${GREEN}✅ Production environment started!${NC}"
echo ""
echo "🌐 Application: http://localhost:8080"
echo "🌍 External Access: https://wmxkwzbmhflj.sealoshzh.site"
echo "📡 Backend API: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo -e "${BLUE}🛑 Stopping all services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID $PROXY_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait 