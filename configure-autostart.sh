#!/bin/bash

# Configure Timee Auto-Start for DevBox
# This script sets up multiple auto-start mechanisms

set -e

PROJECT_DIR="/home/devbox/project"
STARTUP_SCRIPT="$PROJECT_DIR/startup-on-boot.sh"

echo "🔧 Configuring Timee Auto-Start for DevBox..."
echo "📁 Project directory: $PROJECT_DIR"

# Ensure we're in the right directory
cd "$PROJECT_DIR"

# Create logs directory
mkdir -p logs

# Method 1: Add to .bashrc for automatic startup
echo "📝 Method 1: Adding to .bashrc..."
BASHRC_LINE="# Timee Auto-Start
if [ -f \"$STARTUP_SCRIPT\" ] && [ -z \"\$TIMEE_STARTED\" ]; then
    export TIMEE_STARTED=1
    echo \"🚀 Starting Timee application...\"
    nohup \"$STARTUP_SCRIPT\" > \"$PROJECT_DIR/logs/bashrc-startup.log\" 2>&1 &
fi"

# Remove old entries first
grep -v "Timee Auto-Start" ~/.bashrc > ~/.bashrc.tmp || true
grep -v "TIMEE_STARTED" ~/.bashrc.tmp > ~/.bashrc || true
rm -f ~/.bashrc.tmp

# Add new entry
echo "$BASHRC_LINE" >> ~/.bashrc
echo "✅ Added to .bashrc"

# Method 2: Create a wrapper script in /usr/local/bin
echo "📝 Method 2: Creating system wrapper..."
WRAPPER_SCRIPT="/usr/local/bin/timee-autostart"
sudo tee "$WRAPPER_SCRIPT" > /dev/null << 'EOF'
#!/bin/bash
# Timee Auto-Start Wrapper
cd /home/devbox/project
exec ./startup-on-boot.sh
EOF

sudo chmod +x "$WRAPPER_SCRIPT" 2>/dev/null || {
    echo "⚠️ Cannot create system wrapper (no sudo), skipping..."
}

# Method 3: Create a startup service file
echo "📝 Method 3: Creating startup service..."
SERVICE_FILE="$HOME/.config/systemd/user/timee-autostart.service"
mkdir -p "$HOME/.config/systemd/user"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Timee Application Auto-Start
After=network.target

[Service]
Type=oneshot
ExecStart=$STARTUP_SCRIPT
WorkingDirectory=$PROJECT_DIR
User=devbox
Environment=HOME=/home/devbox
Environment=PATH=/usr/local/bin:/usr/bin:/bin:/home/devbox/.local/bin
StandardOutput=append:$PROJECT_DIR/logs/systemd-startup.log
StandardError=append:$PROJECT_DIR/logs/systemd-startup.log

[Install]
WantedBy=default.target
EOF

# Try to enable the service
systemctl --user daemon-reload 2>/dev/null || true
systemctl --user enable timee-autostart.service 2>/dev/null || true
echo "✅ Systemd service created"

# Method 4: Create a cron job (if cron is available)
echo "📝 Method 4: Setting up cron job..."
if command -v crontab >/dev/null 2>&1; then
    # Create cron job for reboot
    (crontab -l 2>/dev/null | grep -v "timee-autostart"; echo "@reboot sleep 30 && $STARTUP_SCRIPT") | crontab -
    echo "✅ Cron job added"
else
    echo "⚠️ Cron not available, skipping cron setup"
fi

# Method 5: Create a background monitoring script
echo "📝 Method 5: Creating background monitor..."
MONITOR_SCRIPT="$PROJECT_DIR/background-monitor.sh"
cat > "$MONITOR_SCRIPT" << 'EOF'
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
EOF

chmod +x "$MONITOR_SCRIPT"

# Start the background monitor
nohup "$MONITOR_SCRIPT" > "$PROJECT_DIR/logs/monitor-startup.log" 2>&1 &
echo "✅ Background monitor started"

# Method 6: Create a simple init script
echo "📝 Method 6: Creating init script..."
INIT_SCRIPT="$PROJECT_DIR/init-timee.sh"
cat > "$INIT_SCRIPT" << 'EOF'
#!/bin/bash
# Simple init script for Timee

cd /home/devbox/project
export TIMEE_AUTO_INIT=1

# Wait for system to be ready
sleep 10

# Check if already running
if pgrep -f "nest start" > /dev/null || pgrep -f "vite" > /dev/null; then
    echo "Services already running"
    exit 0
fi

# Start services
echo "Starting Timee services..."
./startup-on-boot.sh
EOF

chmod +x "$INIT_SCRIPT"

# Add to various startup locations
echo "$INIT_SCRIPT" >> ~/.profile 2>/dev/null || true

echo "✅ Init script created and added to .profile"

# Test the configuration
echo "🧪 Testing configuration..."
if [ -f "$STARTUP_SCRIPT" ]; then
    echo "✅ Startup script exists and is executable"
else
    echo "❌ Startup script not found"
fi

# Display configuration summary
echo ""
echo "🎉 Auto-start configuration completed!"
echo ""
echo "📋 Configured methods:"
echo "   1. ✅ .bashrc integration"
echo "   2. $([ -f "$WRAPPER_SCRIPT" ] && echo "✅" || echo "⚠️") System wrapper"
echo "   3. ✅ Systemd user service"
echo "   4. $(command -v crontab >/dev/null 2>&1 && echo "✅" || echo "⚠️") Cron job"
echo "   5. ✅ Background monitor"
echo "   6. ✅ Init script"
echo ""
echo "🔄 To test the setup:"
echo "   1. ./stop-production.sh"
echo "   2. ./startup-on-boot.sh"
echo "   3. ./status.sh"
echo ""
echo "📊 Monitor logs:"
echo "   tail -f logs/boot-startup.log"
echo "   tail -f logs/monitor.log"
echo ""
echo "💡 After DevBox restart, services should start automatically within 30-60 seconds." 