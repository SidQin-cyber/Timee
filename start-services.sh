#!/bin/bash

# ==============================================
# Timee Project - Unified Service Startup Script
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3000
FRONTEND_PORT=5173
PROXY_PORT=8080

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    fi
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Backend environment
    export NODE_ENV=development
    export PORT=$BACKEND_PORT
    export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"
    export JWT_SECRET="timee-super-secure-jwt-secret-2024"
    export CORS_ORIGIN="*"
    export LOG_LEVEL="debug"
    export PROXY_PORT=$PROXY_PORT
    
    print_success "Environment variables configured"
}

# Function to start backend
start_backend() {
    print_status "Starting backend API server..."
    
    if ! check_port $BACKEND_PORT; then
        print_warning "Backend port $BACKEND_PORT is already in use"
        kill_port $BACKEND_PORT
    fi
    
    cd timee-api
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Start backend in background
    print_status "Starting backend server on port $BACKEND_PORT..."
    npm run start:dev > ../logs/backend.log 2>&1 &
    echo $! > ../backend.pid
    
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend started successfully
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
        print_success "Backend API server started successfully on port $BACKEND_PORT"
    else
        print_error "Failed to start backend API server"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend development server..."
    
    if ! check_port $FRONTEND_PORT; then
        print_warning "Frontend port $FRONTEND_PORT is already in use"
        kill_port $FRONTEND_PORT
    fi
    
    cd timee-frontend/apps/web
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background
    print_status "Starting frontend server on port $FRONTEND_PORT..."
    npm run dev > ../../../logs/frontend.log 2>&1 &
    echo $! > ../../../frontend.pid
    
    cd ../../..
    
    # Wait for frontend to start
    sleep 5
    
    # Check if frontend started successfully
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
        print_success "Frontend development server started successfully on port $FRONTEND_PORT"
    else
        print_error "Failed to start frontend development server"
        return 1
    fi
}

# Function to start proxy server
start_proxy() {
    print_status "Starting proxy server..."
    
    if ! check_port $PROXY_PORT; then
        print_warning "Proxy port $PROXY_PORT is already in use"
        kill_port $PROXY_PORT
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing proxy dependencies..."
        npm install
    fi
    
    # Start proxy in background
    print_status "Starting proxy server on port $PROXY_PORT..."
    node proxy-server.js > logs/proxy.log 2>&1 &
    echo $! > proxy.pid
    
    # Wait for proxy to start
    sleep 3
    
    # Check if proxy started successfully
    if curl -s http://localhost:$PROXY_PORT/health > /dev/null; then
        print_success "Proxy server started successfully on port $PROXY_PORT"
    else
        print_error "Failed to start proxy server"
        return 1
    fi
}

# Function to check service status
check_services() {
    print_status "Checking service status..."
    
    echo ""
    echo "=== Service Status ==="
    
    # Check backend
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
        print_success "✓ Backend API (port $BACKEND_PORT) - Running"
    else
        print_error "✗ Backend API (port $BACKEND_PORT) - Not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
        print_success "✓ Frontend (port $FRONTEND_PORT) - Running"
    else
        print_error "✗ Frontend (port $FRONTEND_PORT) - Not responding"
    fi
    
    # Check proxy
    if curl -s http://localhost:$PROXY_PORT/health > /dev/null; then
        print_success "✓ Proxy Server (port $PROXY_PORT) - Running"
    else
        print_error "✗ Proxy Server (port $PROXY_PORT) - Not responding"
    fi
    
    echo ""
    echo "=== Access URLs ==="
    echo "🌐 Application: http://localhost:$PROXY_PORT"
    echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
    echo "📡 Backend API: http://localhost:$BACKEND_PORT/api"
    echo "🔍 API Health: http://localhost:$BACKEND_PORT/api/health"
    echo "🔧 Proxy Health: http://localhost:$PROXY_PORT/health"
    echo ""
}

# Main execution
main() {
    print_status "Starting Timee Project Services..."
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Setup environment
    setup_environment
    
    # Start services
    start_backend
    start_frontend
    start_proxy
    
    # Check service status
    check_services
    
    print_success "All services started successfully!"
    print_status "Press Ctrl+C to stop all services"
    print_status "Logs are available in the 'logs' directory"
    
    # Wait for user input to stop services
    trap 'stop_services' INT
    
    while true; do
        sleep 1
    done
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    
    # Kill backend
    if [ -f "backend.pid" ]; then
        kill -9 $(cat backend.pid) 2>/dev/null || true
        rm -f backend.pid
    fi
    
    # Kill frontend
    if [ -f "frontend.pid" ]; then
        kill -9 $(cat frontend.pid) 2>/dev/null || true
        rm -f frontend.pid
    fi
    
    # Kill proxy
    if [ -f "proxy.pid" ]; then
        kill -9 $(cat proxy.pid) 2>/dev/null || true
        rm -f proxy.pid
    fi
    
    print_success "All services stopped"
    exit 0
}

# Check if script is run with stop argument
if [ "$1" = "stop" ]; then
    stop_services
    exit 0
fi

# Run main function
main 