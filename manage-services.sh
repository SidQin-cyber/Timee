#!/bin/bash

# 服务管理脚本
# 用于管理 Timee 应用的所有服务

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务配置
API_PORT=3000
FRONTEND_PORT=5173
PROXY_PORT=8080

# 日志目录
LOG_DIR="logs"
mkdir -p $LOG_DIR

print_status() {
    echo -e "${BLUE}[状态]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查服务是否运行
check_service() {
    local port=$1
    local service_name=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        print_success "$service_name 正在运行 (端口 $port)"
        return 0
    else
        print_error "$service_name 未运行 (端口 $port)"
        return 1
    fi
}

# 停止服务
stop_service() {
    local port=$1
    local service_name=$2
    
    print_status "停止 $service_name..."
    
    # 通过端口杀死进程
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
        sleep 2
        if ! lsof -i :$port > /dev/null 2>&1; then
            print_success "$service_name 已停止"
        else
            print_error "$service_name 停止失败"
        fi
    else
        print_warning "$service_name 未运行"
    fi
}

# 停止所有服务
stop_all() {
    echo "🛑 停止所有服务..."
    
    # 停止特定进程
    pkill -f "dist/main" 2>/dev/null
    pkill -f "npm run preview" 2>/dev/null
    pkill -f "proxy-server" 2>/dev/null
    pkill -f "node.*main" 2>/dev/null
    
    # 通过端口停止服务
    stop_service $API_PORT "后端 API"
    stop_service $FRONTEND_PORT "前端服务"
    stop_service $PROXY_PORT "代理服务"
    
    # 清理 PID 文件
    rm -f $LOG_DIR/*.pid
    
    print_success "所有服务已停止"
}

# 启动后端 API
start_api() {
    print_status "启动后端 API..."
    
    if check_service $API_PORT "后端 API"; then
        print_warning "后端 API 已在运行"
        return 0
    fi
    
    cd timee-api
    
    # 检查构建文件
    if [ ! -f "dist/main.js" ]; then
        print_warning "后端未构建，正在构建..."
        npm run build
        if [ $? -ne 0 ]; then
            print_error "后端构建失败"
            cd ..
            return 1
        fi
    fi
    
    # 启动服务
    nohup node dist/main > ../$LOG_DIR/api-production.log 2>&1 &
    API_PID=$!
    echo $API_PID > ../$LOG_DIR/api.pid
    
    cd ..
    
    # 等待服务启动
    sleep 5
    
    if check_service $API_PORT "后端 API"; then
        print_success "后端 API 启动成功 (PID: $API_PID)"
        return 0
    else
        print_error "后端 API 启动失败"
        echo "📝 查看日志: tail -20 $LOG_DIR/api-production.log"
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    print_status "启动前端服务..."
    
    if check_service $FRONTEND_PORT "前端服务"; then
        print_warning "前端服务已在运行"
        return 0
    fi
    
    cd timee-frontend/apps/web
    
    # 检查构建文件
    if [ ! -d "dist" ]; then
        print_warning "前端未构建，正在构建..."
        npm run build
        if [ $? -ne 0 ]; then
            print_error "前端构建失败"
            cd ../../..
            return 1
        fi
    fi
    
    # 启动服务
    nohup npm run preview -- --host 0.0.0.0 --port $FRONTEND_PORT > ../../../$LOG_DIR/frontend-production.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../../$LOG_DIR/frontend.pid
    
    cd ../../..
    
    # 等待服务启动
    sleep 5
    
    if check_service $FRONTEND_PORT "前端服务"; then
        print_success "前端服务启动成功 (PID: $FRONTEND_PID)"
        return 0
    else
        print_error "前端服务启动失败"
        echo "📝 查看日志: tail -20 $LOG_DIR/frontend-production.log"
        return 1
    fi
}

# 启动代理服务
start_proxy() {
    print_status "启动代理服务..."
    
    if check_service $PROXY_PORT "代理服务"; then
        print_warning "代理服务已在运行"
        return 0
    fi
    
    # 检查代理服务器文件
    if [ ! -f "proxy-server.js" ]; then
        print_error "代理服务器文件不存在"
        return 1
    fi
    
    # 启动服务
    nohup node proxy-server.js > $LOG_DIR/proxy-production.log 2>&1 &
    PROXY_PID=$!
    echo $PROXY_PID > $LOG_DIR/proxy.pid
    
    # 等待服务启动
    sleep 3
    
    if check_service $PROXY_PORT "代理服务"; then
        print_success "代理服务启动成功 (PID: $PROXY_PID)"
        return 0
    else
        print_error "代理服务启动失败"
        echo "📝 查看日志: tail -20 $LOG_DIR/proxy-production.log"
        return 1
    fi
}

# 启动所有服务
start_all() {
    echo "🚀 启动所有服务..."
    
    # 设置环境变量
    export NODE_ENV=production
    export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/timee_db"
    export JWT_SECRET="TQ9tZLylPmuJrSqfD4RmkJDUO+TtcjlpRckSuEjf9DM="
    export CORS_ORIGIN="*"
    export ALLOWED_ORIGINS="https://www.timee.group,https://timee.group,https://buchleuycboo.sealoshzh.site,http://localhost:8080,http://localhost:5173"
    export PROXY_PORT=8080
    export LOG_LEVEL="debug"
    export EXTERNAL_API_URL="https://www.timee.group"
    
    # 按顺序启动服务
    start_api
    sleep 3
    start_frontend
    sleep 3
    start_proxy
    
    echo ""
    echo "🎉 服务启动完成！"
    status
}

# 重启所有服务
restart_all() {
    echo "🔄 重启所有服务..."
    stop_all
    sleep 5
    start_all
}

# 显示服务状态
status() {
    echo "📊 服务状态检查..."
    echo ""
    
    check_service $API_PORT "后端 API"
    check_service $FRONTEND_PORT "前端服务"
    check_service $PROXY_PORT "代理服务"
    
    echo ""
    echo "🌐 访问地址:"
    echo "   主应用:        http://localhost:$PROXY_PORT"
    echo "   后端 API:      http://localhost:$API_PORT/api"
    echo "   前端服务:      http://localhost:$FRONTEND_PORT"
    echo "   外部域名:      https://www.timee.group"
    echo ""
    echo "📝 日志文件:"
    echo "   后端日志:      $LOG_DIR/api-production.log"
    echo "   前端日志:      $LOG_DIR/frontend-production.log"
    echo "   代理日志:      $LOG_DIR/proxy-production.log"
}

# 查看日志
logs() {
    local service=$1
    case $service in
        "api"|"backend")
            echo "📡 后端 API 日志:"
            tail -50 $LOG_DIR/api-production.log
            ;;
        "frontend"|"web")
            echo "🌐 前端服务日志:"
            tail -50 $LOG_DIR/frontend-production.log
            ;;
        "proxy")
            echo "🔄 代理服务日志:"
            tail -50 $LOG_DIR/proxy-production.log
            ;;
        "all"|"")
            echo "📡 后端 API 日志 (最后 20 行):"
            tail -20 $LOG_DIR/api-production.log
            echo ""
            echo "🌐 前端服务日志 (最后 20 行):"
            tail -20 $LOG_DIR/frontend-production.log
            echo ""
            echo "🔄 代理服务日志 (最后 20 行):"
            tail -20 $LOG_DIR/proxy-production.log
            ;;
        *)
            echo "❌ 未知服务: $service"
            echo "可用服务: api, frontend, proxy, all"
            ;;
    esac
}

# 测试功能
test_functionality() {
    echo "🧪 测试应用功能..."
    
    # 测试 API 健康检查
    echo "1. 测试 API 健康检查..."
    if curl -s -f http://localhost:$PROXY_PORT/api/health > /dev/null; then
        print_success "API 健康检查通过"
    else
        print_error "API 健康检查失败"
    fi
    
    # 测试获取活动列表
    echo "2. 测试获取活动列表..."
    if curl -s -f http://localhost:$PROXY_PORT/api/events > /dev/null; then
        print_success "获取活动列表成功"
    else
        print_error "获取活动列表失败"
    fi
    
    # 测试前端页面
    echo "3. 测试前端页面..."
    if curl -s -f http://localhost:$PROXY_PORT > /dev/null; then
        print_success "前端页面访问成功"
    else
        print_error "前端页面访问失败"
    fi
    
    echo ""
    echo "✅ 功能测试完成"
}

# 帮助信息
help() {
    echo "Timee 服务管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start         启动所有服务"
    echo "  stop          停止所有服务"
    echo "  restart       重启所有服务"
    echo "  status        显示服务状态"
    echo "  logs [服务]   查看日志 (api|frontend|proxy|all)"
    echo "  test          测试应用功能"
    echo "  help          显示帮助信息"
    echo ""
    echo "服务管理:"
    echo "  start-api     只启动后端 API"
    echo "  start-frontend 只启动前端服务"
    echo "  start-proxy   只启动代理服务"
    echo ""
    echo "示例:"
    echo "  $0 start              # 启动所有服务"
    echo "  $0 status             # 查看服务状态"
    echo "  $0 logs api           # 查看后端日志"
    echo "  $0 test               # 测试功能"
}

# 主程序
case $1 in
    "start")
        start_all
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "status")
        status
        ;;
    "logs")
        logs $2
        ;;
    "test")
        test_functionality
        ;;
    "start-api")
        start_api
        ;;
    "start-frontend")
        start_frontend
        ;;
    "start-proxy")
        start_proxy
        ;;
    "help"|"--help"|"-h")
        help
        ;;
    "")
        status
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo "使用 '$0 help' 查看帮助信息"
        exit 1
        ;;
esac 