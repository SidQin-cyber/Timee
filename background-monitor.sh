#!/bin/bash
# Background Health Monitor for Timee

PROJECT_DIR="/home/devbox/project"
LOG_FILE="$PROJECT_DIR/logs/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR"

while true; do
    # Check every 5 minutes
    sleep 300
    
    # Check if services are running
    if ! pgrep -f "nest start" > /dev/null && ! pgrep -f "vite" > /dev/null && ! pgrep -f "proxy-server" > /dev/null; then
        log_message "⚠️ No services running, attempting restart..."
        ./startup-on-boot.sh
    elif ! ./check-health.sh > /dev/null 2>&1; then
        log_message "⚠️ Health check failed, attempting restart..."
        ./quick-start.sh || ./auto-start.sh
    fi
done
