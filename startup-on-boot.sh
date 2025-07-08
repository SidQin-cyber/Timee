#!/bin/bash

# Timee Auto-Start on DevBox Boot
# This script ensures services start automatically when DevBox restarts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/home/devbox/project"
LOG_FILE="$PROJECT_DIR/logs/boot-startup.log"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_message "🔄 DevBox Boot - Starting Timee Auto-Start"
log_message "📁 Script directory: $SCRIPT_DIR"
log_message "📁 Project directory: $PROJECT_DIR"

# Change to project directory
cd "$PROJECT_DIR" || {
    log_message "❌ Failed to change to project directory"
    exit 1
}

# Wait for system to be fully ready
log_message "⏳ Waiting for system to be ready..."
sleep 15

# Check if services are already running
if pgrep -f "nest start" > /dev/null || pgrep -f "vite" > /dev/null || pgrep -f "proxy-server" > /dev/null; then
    log_message "ℹ️ Services already running, checking health..."
    if ./check-health.sh; then
        log_message "✅ Services are healthy, no restart needed"
        exit 0
    else
        log_message "⚠️ Services unhealthy, restarting..."
        ./stop-production.sh || true
        sleep 5
    fi
fi

# Start services
log_message "🚀 Starting Timee services..."
if ./quick-start.sh; then
    log_message "✅ Services started successfully"
    
    # Verify services are running
    sleep 10
    if ./check-health.sh; then
        log_message "✅ Health check passed"
        log_message "🌍 Application ready at: https://wmxkwzbmhflj.sealoshzh.site"
    else
        log_message "⚠️ Health check failed, trying auto-start..."
        ./auto-start.sh
    fi
else
    log_message "❌ Quick start failed, trying auto-start..."
    ./auto-start.sh
fi

log_message "🎉 Auto-start process completed" 