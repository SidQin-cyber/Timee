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
