#!/bin/bash

# Timee Application Entrypoint with Auto-Start
# This script ensures services start automatically when DevBox restarts

set -e

echo "🚀 Timee Application Starting..."
echo "📅 $(date)"
echo "📁 Working directory: $(pwd)"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /home/devbox/project/logs/startup.log
}

# Create logs directory if it doesn't exist
mkdir -p /home/devbox/project/logs

log_message "🔧 Starting Timee Application Entrypoint"

# Change to project directory
cd /home/devbox/project

# Wait for system to be ready
log_message "⏳ Waiting for system to be ready..."
sleep 5

# Check if services are already running
if pgrep -f "nest start" > /dev/null || pgrep -f "vite" > /dev/null || pgrep -f "proxy-server" > /dev/null; then
    log_message "ℹ️ Services already running, checking health..."
    if ./check-health.sh; then
        log_message "✅ Services are healthy, no restart needed"
        # Keep the container running
        exec tail -f /dev/null
    else
        log_message "⚠️ Services unhealthy, restarting..."
        ./stop-production.sh || true
        sleep 3
    fi
fi

# Start services with quick-start
log_message "🚀 Starting services with quick-start..."
if ./quick-start.sh; then
    log_message "✅ Quick start completed successfully"
else
    log_message "❌ Quick start failed, trying auto-start with monitoring..."
    if ./auto-start.sh; then
        log_message "✅ Auto-start completed successfully"
    else
        log_message "❌ Both startup methods failed, manual intervention required"
    exit 1
fi
fi

# Verify services are running
log_message "🔍 Verifying services..."
sleep 10

if ./check-health.sh; then
    log_message "✅ All services are healthy and running"
    
    # Display service status
    ./status.sh
    
    log_message "🌍 Application is ready at: https://wmxkwzbmhflj.sealoshzh.site"
    log_message "📊 Monitor with: ./status.sh"
    log_message "🔧 Manage with: ./auto-start.sh"
    
    # Start background health monitoring
    log_message "🩺 Starting background health monitoring..."
    (
        while true; do
            sleep 300  # Check every 5 minutes
            if ! ./check-health.sh > /dev/null 2>&1; then
                log_message "⚠️ Health check failed, attempting restart..."
                ./quick-start.sh || ./auto-start.sh
            fi
        done
    ) &
    
    # Keep container running
    exec tail -f /dev/null
else
    log_message "❌ Services failed to start properly"
    log_message "📋 Service status:"
    ./status.sh
    exit 1
fi