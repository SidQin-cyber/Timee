#!/bin/bash

# ==============================================
# Timee Project - Quick Development Start
# ==============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Timee Development Environment...${NC}"

# Setup environment variables
export NODE_ENV=development
export PORT=3000
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"
export JWT_SECRET="timee-super-secure-jwt-secret-2024"
export CORS_ORIGIN="*"
export LOG_LEVEL="debug"
export PROXY_PORT=8080

# Start backend in background
echo -e "${BLUE}📡 Starting Backend API...${NC}"
cd timee-api
npm run start:dev &
BACKEND_PID=$!
cd ..

# Start frontend in background  
echo -e "${BLUE}💻 Starting Frontend...${NC}"
cd timee-frontend/apps/web
npm run dev &
FRONTEND_PID=$!
cd ../../..

# Start proxy server
echo -e "${BLUE}🔄 Starting Proxy Server...${NC}"
node proxy-server.js &
PROXY_PID=$!

# Wait a bit for services to start
sleep 8

echo -e "${GREEN}✅ Development environment started!${NC}"
echo ""
echo "🌐 Application: http://localhost:8080"
echo "📱 Frontend: http://localhost:5173"
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