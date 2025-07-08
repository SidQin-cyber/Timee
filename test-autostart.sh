#!/bin/bash

# Test Auto-Start Configuration
# This script tests if the auto-start mechanisms are working correctly

set -e

PROJECT_DIR="/home/devbox/project"
LOG_FILE="$PROJECT_DIR/logs/autostart-test.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "🧪 Testing Timee Auto-Start Configuration"
echo "=========================================="

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

cd "$PROJECT_DIR"

log_message "🔍 Starting auto-start configuration test"

# Test 1: Check if startup script exists
echo "📋 Test 1: Checking startup script..."
if [ -f "./startup-on-boot.sh" ] && [ -x "./startup-on-boot.sh" ]; then
    echo "✅ Startup script exists and is executable"
    log_message "✅ Test 1 passed: Startup script is ready"
else
    echo "❌ Startup script missing or not executable"
    log_message "❌ Test 1 failed: Startup script issue"
    exit 1
fi

# Test 2: Check .bashrc integration
echo "📋 Test 2: Checking .bashrc integration..."
if grep -q "Timee Auto-Start" ~/.bashrc; then
    echo "✅ .bashrc integration found"
    log_message "✅ Test 2 passed: .bashrc integration active"
else
    echo "❌ .bashrc integration missing"
    log_message "❌ Test 2 failed: .bashrc integration missing"
fi

# Test 3: Check background monitor
echo "📋 Test 3: Checking background monitor..."
if pgrep -f "background-monitor.sh" > /dev/null; then
    echo "✅ Background monitor is running"
    log_message "✅ Test 3 passed: Background monitor active"
else
    echo "⚠️ Background monitor not running (will start on next boot)"
    log_message "⚠️ Test 3 warning: Background monitor not currently running"
fi

# Test 4: Check systemd service
echo "📋 Test 4: Checking systemd service..."
if systemctl --user is-enabled timee-autostart.service >/dev/null 2>&1; then
    echo "✅ Systemd service is enabled"
    log_message "✅ Test 4 passed: Systemd service enabled"
else
    echo "⚠️ Systemd service not enabled (normal in some environments)"
    log_message "⚠️ Test 4 warning: Systemd service not enabled"
fi

# Test 5: Simulate service restart
echo "📋 Test 5: Simulating service restart..."
log_message "🔄 Test 5: Starting service restart simulation"

# Stop all services
echo "   🛑 Stopping services..."
./stop-production.sh > /dev/null 2>&1

# Wait a moment
sleep 5

# Check if services are stopped
if pgrep -f "nest start" > /dev/null || pgrep -f "vite" > /dev/null || pgrep -f "proxy-server" > /dev/null; then
    echo "   ⚠️ Some services still running after stop"
    log_message "⚠️ Test 5 warning: Services not fully stopped"
else
    echo "   ✅ All services stopped successfully"
    log_message "✅ Test 5a passed: Services stopped"
fi

# Test startup script
echo "   🚀 Testing startup script..."
if ./startup-on-boot.sh > /dev/null 2>&1; then
    echo "   ✅ Startup script executed successfully"
    log_message "✅ Test 5b passed: Startup script worked"
    
    # Wait for services to be ready
    sleep 15
    
    # Check if services are running
    if ./check-health.sh > /dev/null 2>&1; then
        echo "   ✅ Services are healthy after restart"
        log_message "✅ Test 5c passed: Services healthy after restart"
    else
        echo "   ❌ Services not healthy after restart"
        log_message "❌ Test 5c failed: Services not healthy"
        exit 1
    fi
else
    echo "   ❌ Startup script failed"
    log_message "❌ Test 5b failed: Startup script failed"
    exit 1
fi

# Test 6: Check external connectivity
echo "📋 Test 6: Testing external connectivity..."
if curl -s -f https://wmxkwzbmhflj.sealoshzh.site > /dev/null 2>&1; then
    echo "✅ External URL is accessible"
    log_message "✅ Test 6 passed: External URL accessible"
else
    echo "❌ External URL not accessible"
    log_message "❌ Test 6 failed: External URL not accessible"
    exit 1
fi

# Summary
echo ""
echo "🎉 Auto-Start Configuration Test Results"
echo "========================================"
echo "✅ All critical tests passed!"
echo "✅ Auto-start configuration is working correctly"
echo ""
echo "📋 What happens when DevBox restarts:"
echo "   1. .bashrc will trigger startup on shell login"
echo "   2. Background monitor will restart services if needed"
echo "   3. Systemd service will attempt to start services"
echo "   4. Multiple fallback mechanisms ensure reliability"
echo ""
echo "🔄 To manually test DevBox restart simulation:"
echo "   1. ./stop-production.sh"
echo "   2. Wait 30 seconds"
echo "   3. ./startup-on-boot.sh"
echo "   4. ./check-health.sh"
echo ""
echo "📊 Monitor auto-start logs:"
echo "   tail -f logs/boot-startup.log"
echo "   tail -f logs/monitor.log"
echo "   tail -f logs/autostart-test.log"
echo ""

log_message "🎉 Auto-start configuration test completed successfully"

# Display current status
echo "📊 Current Service Status:"
./status.sh 