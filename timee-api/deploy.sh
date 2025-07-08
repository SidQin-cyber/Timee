#!/bin/bash
echo "🚀 Deploying Timee API to Production..."

# 设置错误时退出
set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要文件
check_files() {
    log_info "Checking required files..."
    
    required_files=(
        "src/index.js"
        "package.json"
        "prisma/schema.prisma"
        "sealos-unified-config.yaml"
        "start-express.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    log_info "All required files present ✓"
}

# 停止现有服务
stop_existing() {
    log_info "Stopping existing services..."
    pkill -f "src/index.js" 2>/dev/null || true
    pkill -f "dist/main" 2>/dev/null || true
    pkill -f "nest" 2>/dev/null || true
    sleep 3
    log_info "Existing services stopped ✓"
}

# 安装依赖
install_deps() {
    log_info "Installing dependencies..."
    npm ci --only=production --silent
    log_info "Dependencies installed ✓"
}

# 设置数据库
setup_database() {
    log_info "Setting up database..."
    
    # 设置环境变量
    export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres?schema=public"
    
    # 生成 Prisma 客户端
    log_info "Generating Prisma client..."
    npx prisma generate
    
    # 应用迁移
    log_info "Applying database migrations..."
    npx prisma migrate deploy
    
    log_info "Database setup complete ✓"
}

# 应用 Sealos 配置
apply_sealos_config() {
    log_info "Applying Sealos Ingress configuration..."
    
    if command -v kubectl &> /dev/null; then
        kubectl apply -f sealos-unified-config.yaml
        log_info "Sealos configuration applied ✓"
    else
        log_warn "kubectl not found, skipping Sealos config application"
        log_warn "Please apply sealos-unified-config.yaml manually"
    fi
}

# 启动服务
start_service() {
    log_info "Starting Express server..."
    
    # 设置环境变量
    export PORT=8080
    export NODE_ENV=production
    export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres?schema=public"
    
    # 启动服务器（后台运行）
    nohup node src/index.js > api.log 2>&1 &
    
    # 等待服务启动
    sleep 5
    
    # 检查服务是否启动成功
    if curl -s http://localhost:8080/health > /dev/null; then
        log_info "Server started successfully ✓"
        log_info "API available at: http://localhost:8080"
        log_info "Health check: http://localhost:8080/health"
    else
        log_error "Failed to start server"
        log_error "Check api.log for details"
        exit 1
    fi
}

# 部署后验证
verify_deployment() {
    log_info "Verifying deployment..."
    
    # 检查进程
    if pgrep -f "src/index.js" > /dev/null; then
        log_info "Process running ✓"
    else
        log_error "Process not running"
        exit 1
    fi
    
    # 检查端口
    if netstat -tlnp 2>/dev/null | grep :8080 > /dev/null; then
        log_info "Port 8080 listening ✓"
    else
        log_error "Port 8080 not listening"
        exit 1
    fi
    
    # 测试API
    if curl -s http://localhost:8080/health | grep -q "OK"; then
        log_info "API health check passed ✓"
    else
        log_error "API health check failed"
        exit 1
    fi
    
    log_info "Deployment verification complete ✓"
}

# 显示部署状态
show_status() {
    echo ""
    echo "=================================="
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY"
    echo "=================================="
    echo ""
    echo "📍 Service Status:"
    echo "   - API Server: Running on port 8080"
    echo "   - Database: Connected"
    echo "   - WebSocket: Enabled"
    echo ""
    echo "🔗 Endpoints:"
    echo "   - Health: http://localhost:8080/health"
    echo "   - API Base: http://localhost:8080/api"
    echo "   - Socket.IO: http://localhost:8080/socket.io"
    echo ""
    echo "📋 Logs:"
    echo "   - Application: ./api.log"
    echo "   - View logs: tail -f api.log"
    echo ""
    echo "🛠️ Management:"
    echo "   - Stop: pkill -f 'src/index.js'"
    echo "   - Restart: ./start-express.sh"
    echo ""
}

# 主要部署流程
main() {
    log_info "Starting deployment process..."
    
    check_files
    stop_existing
    install_deps
    setup_database
    apply_sealos_config
    start_service
    verify_deployment
    show_status
    
    log_info "Deployment completed successfully! 🎉"
}

# 捕获错误
trap 'log_error "Deployment failed at line $LINENO. Check the logs for details."' ERR

# 运行主流程
main "$@" 